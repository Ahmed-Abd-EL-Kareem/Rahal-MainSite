import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/lib/api/ai';
import type { ChatConversation, ChatConversationMessage } from '@/lib/chat/types';
import type { SuccessResponse } from '@/types/api';

const detailKey = (sessionId?: string) => ['chatConversation', sessionId] as const;
const listKey = ['chatConversations'] as const;

export function useChatConversation(sessionId?: string) {
  return useQuery({
    queryKey: detailKey(sessionId),
    queryFn: () => aiApi.getChatConversation(sessionId!),
    enabled: !!sessionId,
  });
}

export function useChatConversations() {
  return useQuery({
    queryKey: listKey,
    queryFn: () => aiApi.listChatConversations(),
  });
}

export function useSendChatMessage(sessionId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => aiApi.sendChatMessage({ message, sessionId }),
    onMutate: async (message: string) => {
      await queryClient.cancelQueries({ queryKey: detailKey(sessionId) });

      const previousConversation = queryClient.getQueryData<SuccessResponse<ChatConversation>>(detailKey(sessionId));

      const optimisticMessage: ChatConversationMessage = {
        role: 'user',
        content: message,
        createdAt: new Date().toISOString(),
      };

      const optimisticConversation: ChatConversation | undefined = previousConversation?.data
        ? {
            ...previousConversation.data,
            messages: [...previousConversation.data.messages, optimisticMessage],
          }
        : undefined;

      if (optimisticConversation) {
        queryClient.setQueryData(detailKey(sessionId), {
          ...previousConversation!,
          data: optimisticConversation,
        });
      }

      return { previousConversation };
    },
    onError: (_err, _message, context) => {
      if (context?.previousConversation) {
        queryClient.setQueryData(detailKey(sessionId), context.previousConversation);
      }
    },
    onSuccess: (response: SuccessResponse<ChatConversation>) => {
      const conversation = response.data;
      queryClient.setQueryData(detailKey(conversation.sessionId), response);
      queryClient.invalidateQueries({ queryKey: listKey });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: detailKey(sessionId) });
    },
  });
}

export function useDeleteChatConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => aiApi.deleteChatConversation(sessionId),
    onSuccess: (_data, sessionId) => {
      queryClient.removeQueries({ queryKey: detailKey(sessionId) });
      queryClient.invalidateQueries({ queryKey: listKey });
    },
  });
}

export function useRenameChatConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, title }: { sessionId: string; title: string }) =>
      aiApi.renameChatConversation(sessionId, title),
    onSuccess: (response: SuccessResponse<ChatConversation>) => {
      const conversation = response.data;
      queryClient.setQueryData(detailKey(conversation.sessionId), response);
      queryClient.invalidateQueries({ queryKey: listKey });
    },
  });
}