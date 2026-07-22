import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/lib/api/ai';
import type { SendBookingMessageInput } from '@/lib/chat/types';

const conversationKey = (sessionId?: string) => ['bookingConversation', sessionId] as const;
const conversationsKey = ['bookingConversations'] as const;

export function useBookingConversation(sessionId?: string) {
  return useQuery({
    queryKey: conversationKey(sessionId),
    queryFn: () => aiApi.getBookingConversation(sessionId!),
    enabled: !!sessionId,
  });
}

export function useBookingConversations() {
  return useQuery({
    queryKey: conversationsKey,
    queryFn: () => aiApi.listBookingConversations(),
  });
}

export function useSendBookingMessage(sessionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) =>
      aiApi.sendBookingMessage({ message, sessionId }),
    onSuccess: (response) => {
      const data = response.data;
      queryClient.setQueryData(conversationKey(data.sessionId), response);
      queryClient.invalidateQueries({ queryKey: conversationsKey });
    },
  });
}

export function useDeleteBookingConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => aiApi.deleteBookingConversation(sessionId),
    onSuccess: (_data, sessionId) => {
      queryClient.removeQueries({ queryKey: conversationKey(sessionId) });
      queryClient.invalidateQueries({ queryKey: conversationsKey });
    },
  });
}

export function useCreateBookingConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendBookingMessageInput) => aiApi.sendBookingMessage(input),
    onSuccess: (response) => {
      const data = response.data;
      queryClient.setQueryData(conversationKey(data.sessionId), response);
      queryClient.invalidateQueries({ queryKey: conversationsKey });
    },
  });
}