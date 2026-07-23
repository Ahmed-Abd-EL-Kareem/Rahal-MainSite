'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import {
  Send,
  Plus,
  History,
  Sparkles,
  Loader2,
  Compass,
  AlertCircle,
  Trash2,
  Edit2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { Subscription } from '@/types/subscription';
import { cn } from '@/lib/utils/cn';
import type { Locale } from '@/i18n/config';
import {
  useChatConversation,
  useChatConversations,
  useSendChatMessage,
  useDeleteChatConversation,
  useRenameChatConversation,
} from '@/hooks/useAI';
import { useAuth } from '@/components/providers/AuthProvider';

// Type for conversation list item from API (matches ChatConversation)
interface ConversationListItem {
  sessionId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{ role: string; content: string; createdAt?: string }>;
}

export default function AITravelChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale() as Locale;
  const t = useTranslations('home.chatbot');
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const isAr = locale === 'ar';

  // Session ID from URL query param (not localStorage)
  const sessionId = searchParams.get('sessionId') ?? undefined;

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'error' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  // Local messages for new chat (before sessionId exists)
  const [localMessages, setLocalMessages] = useState<Array<{ role: string; content: string; createdAt?: string }>>([]);

  // Fetch subscription data
  useEffect(() => {
    if (isAuthenticated) {
      subscriptionsApi.getMySubscription()
        .then((res: { data: Subscription }) => setSubscription(res.data))
        .catch(console.error);
    }
  }, [isAuthenticated]);

  // React Query hooks
  const { data: conversation } = useChatConversation(sessionId);
  const { data: history } = useChatConversations();
  const sendMessage = useSendChatMessage(sessionId);
  const deleteConversation = useDeleteChatConversation();
  const renameConversation = useRenameChatConversation();

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom helper (defined before useEffect)
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const showToast = useCallback((message: string, type: 'info' | 'error' = 'info') => {
    setToast({ message, type });
  }, []);

  // Token limits calculations
  const tokensUsed = subscription?.usage?.tokensUsedThisMonth ?? 0;
  const tokensLimit = subscription?.plan?.limits?.tokensPerMonth ?? 15000;
  const isUnlimited = tokensLimit === null;
  const usagePercentage = isUnlimited ? 0 : Math.min(100, Math.round((tokensUsed / tokensLimit) * 100));

  // Scroll to bottom when messages or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [sessionId ? conversation?.data?.messages : localMessages, isLoading, scrollToBottom]);

  // Toast auto-dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Optimistic update for new chats (no sessionId)
    if (!sessionId) {
      const userMessage = { role: 'user', content: text, createdAt: new Date().toISOString() };
      setLocalMessages(prev => [...prev, userMessage]);
    }

    setIsLoading(true);

    try {
      const result = await sendMessage.mutateAsync(text);
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (!sessionId) {
        router.replace(`/chat?sessionId=${result.data.sessionId}`);
      }
    } catch (err: unknown) {
      // Rollback on error for new chats
      if (!sessionId) {
        setLocalMessages(prev => prev.slice(0, -1));
      }
      console.error('Chat API Error:', err);
      showToast(t('requestFailed'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleNewChat = () => {
    setLocalMessages([]);
    router.push('/chat');
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation.mutateAsync(conversationId);
      if (sessionId === conversationId) {
        router.push('/chat');
      }
      showToast(t('chatDeleted'));
    } catch (err) {
      console.error('Delete conversation error:', err);
      showToast(t('requestFailed'), 'error');
    }
  };

  const handleRenameStart = (conversation: ConversationListItem) => {
    setEditingConversationId(conversation.sessionId);
    setEditTitle(conversation.title);
  };

  const handleRenameSave = async (conversationId: string) => {
    if (!editTitle.trim()) return;
    try {
      await renameConversation.mutateAsync({ sessionId: conversationId, title: editTitle });
      setEditingConversationId(null);
      setEditTitle('');
      showToast(t('chatRenamed'));
    } catch (err) {
      console.error('Rename conversation error:', err);
      showToast(t('requestFailed'), 'error');
    }
  };

  const handleRenameCancel = () => {
    setEditingConversationId(null);
    setEditTitle('');
  };

  // Derived data
  const messages = sessionId 
    ? conversation?.data?.messages ?? [] 
    : localMessages;

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-on-surface-variant">
            {isAr ? 'جاري التحقق من الهوية...' : 'Authenticating...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center p-8">
          <p className="text-on-surface-variant mb-4">
            {isAr ? 'يرجى تسجيل الدخول للمتابعة' : 'Please log in to continue'}
          </p>
          <button
            onClick={() => router.push(`/${locale}/login`)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:scale-[0.98] transition-transform"
          >
            {isAr ? 'تسجيل الدخول' : 'Log In'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden bg-background pt-20 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md animate-in fade-in slide-in-from-top duration-300 bg-surface/90 border-outline-variant/30 text-on-surface text-sm">
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-error shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-primary shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-20 left-4 z-40 bg-primary text-white p-2 rounded-lg shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? t('closeSidebar') : t('openSidebar')}
      >
        {sidebarOpen ? <History className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>

      {/* Left Sidebar: Chat History & Token usage */}
      <aside
        className={cn(
          'hidden md:flex w-80 flex-col border-r border-outline-variant/20 bg-surface-container-low/50 overflow-hidden shrink-0 transition-transform duration-300',
          sidebarOpen && 'md:hidden fixed inset-y-0 left-0 z-30 w-80 bg-surface-container-low border-r border-outline-variant/20 shadow-xl'
        )}
      >
        {/* New Chat Button */}
        <div className="p-4 border-b border-outline-variant/20">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-lg hover:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            {t('newChat')}
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {history?.data?.length === 0 ? (
            <p className="text-xs text-outline text-center py-8">{t('noConversations')}</p>
          ) : (
            history?.data?.map((conv: ConversationListItem) => (
              <div
                key={conv.sessionId}
                className={cn(
                  'relative rounded-lg transition-colors',
                  sessionId === conv.sessionId
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-surface-container-low'
                )}
              >
                {editingConversationId === conv.sessionId ? (
                  <div className="p-2 flex gap-1">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameSave(conv.sessionId)}
                      onBlur={() => handleRenameCancel()}
                      autoFocus
                      className="flex-1 px-2 py-1 text-sm border border-outline-variant rounded bg-surface text-on-surface outline-none focus:ring-2 focus:ring-primary"
                      placeholder={t('chatTitlePlaceholder')}
                    />
                    <button
                      onClick={() => handleRenameSave(conv.sessionId)}
                      className="p-1 text-primary hover:bg-primary/10 rounded"
                      aria-label={t('save')}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleRenameCancel}
                      className="p-1 text-on-surface-variant hover:bg-surface-container rounded"
                      aria-label={t('cancel')}
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <a
                      href={`/chat?sessionId=${conv.sessionId}`}
                      className="flex items-center justify-between p-3 pr-10"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/chat?sessionId=${conv.sessionId}`);
                      }}
                    >
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-on-surface truncate">{conv.title}</p>
                        <p className="text-[10px] text-outline truncate">
                          {new Date(conv.updatedAt).toLocaleDateString(locale, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRenameStart(conv);
                          }}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          aria-label={t('renameChat')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteConversation(conv.sessionId);
                          }}
                          className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                          aria-label={t('deleteChat')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </a>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Token Usage / AI Credits */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-on-surface-variant">{t('creditsTitle')}</span>
            <span className="text-xs font-bold text-primary">
              {isUnlimited ? '∞' : `${tokensUsed}/${tokensLimit}`}
            </span>
          </div>
          {!isUnlimited && (
            <div className="w-full h-1.5 bg-surface-variant/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(200,146,42,0.3)]"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          )}
          <p className="mt-3 text-xs text-outline leading-tight">
            {t('creditsReset')}
          </p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className="flex-1 flex flex-col relative bg-surface-bright/20 overflow-hidden h-full">
        {/* Messages Display */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 py-8 space-y-6 relative z-10">
          {messages.length === 0 ? (
            /* Welcome Header & Suggestion Chips */
            <div className="max-w-2xl mx-auto flex flex-col h-full justify-center py-10 md:py-20">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative shadow-inner ring-1 ring-primary/20">
                  <Compass className="w-10 h-10 text-primary animate-pulse" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success border-2 border-surface rounded-full flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-on-background mb-3">
                  {t('welcomeTitle')}
                </h2>
                <p className="text-sm md:text-base text-on-surface-variant max-w-md mx-auto">
                  {t('welcomeSubtitle')}
                </p>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => handleSendMessage(t('suggestion1'))}
                  className="px-5 py-2.5 rounded-full border border-outline-variant/60 text-xs md:text-sm font-semibold text-on-surface hover:bg-primary hover:text-white hover:border-primary active:scale-[0.98] transition-all duration-200 flex items-center gap-2 group cursor-pointer bg-surface/50"
                >
                  <History className="w-4 h-4 text-outline group-hover:text-white" />
                  {t('suggestion1')}
                </button>
                <button
                  onClick={() => handleSendMessage(t('suggestion2'))}
                  className="px-5 py-2.5 rounded-full border border-outline-variant/60 text-xs md:text-sm font-semibold text-on-surface hover:bg-primary hover:text-white hover:border-primary active:scale-[0.98] transition-all duration-200 flex items-center gap-2 group cursor-pointer bg-surface/50"
                >
                  <Compass className="w-4 h-4 text-outline group-hover:text-white" />
                  {t('suggestion2')}
                </button>
                <button
                  onClick={() => handleSendMessage(t('suggestion3'))}
                  className="px-5 py-2.5 rounded-full border border-outline-variant/60 text-xs md:text-sm font-semibold text-on-surface hover:bg-primary hover:text-white hover:border-primary active:scale-[0.98] transition-all duration-200 flex items-center gap-2 group cursor-pointer bg-surface/50"
                >
                  <Sparkles className="w-4 h-4 text-outline group-hover:text-white" />
                  {t('suggestion3')}
                </button>
              </div>
            </div>
          ) : (
            /* Active Messages Log */
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={index}
                    className={cn(
                      'flex gap-3 md:gap-4 max-w-[85%] md:max-w-[80%]',
                      isUser
                        ? (isAr ? 'mr-auto flex-row-reverse' : 'ml-auto flex-row-reverse')
                        : (isAr ? 'ml-auto flex-row' : 'mr-auto flex-row')
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        'w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md relative overflow-hidden',
                        isUser
                          ? 'bg-primary/20 text-primary border border-primary/20'
                          : 'bg-obsidian text-primary border border-primary/10'
                      )}
                    >
                      {isUser ? (
                        <span className="text-sm md:text-base font-bold text-primary">
                          U
                        </span>
                      ) : (
                        <Image
                          src="/images/logo.png"
                          alt="Rahal AI"
                          fill
                          sizes="40px"
                          className="object-contain p-1.5"
                        />
                      )}
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={cn(
                        'p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm',
                        isUser
                          ? cn(
                              'bg-primary text-white whitespace-pre-wrap',
                              isAr ? 'rounded-tl-none' : 'rounded-tr-none'
                            )
                          : cn(
                              'bg-surface border border-outline-variant/20 text-on-surface prose dark:prose-invert max-w-none',
                              isAr ? 'rounded-tr-none text-right' : 'rounded-tl-none text-left'
                            )
                      )}
                    >
                      {isUser ? (
                        msg.content
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ ...props }) => <h1 className="text-lg md:text-xl font-bold mt-4 mb-2 text-primary" {...props} />,
                            h2: ({ ...props }) => <h2 className="text-base md:text-lg font-semibold mt-3.5 mb-2 text-primary" {...props} />,
                            h3: ({ ...props }) => <h3 className="text-sm md:text-base font-semibold mt-3 mb-1.5 text-on-surface" {...props} />,
                            p: ({ ...props }) => <p className="mb-3 last:mb-0 leading-relaxed text-on-surface-variant" {...props} />,
                            ul: ({ ...props }) => <ul className="list-disc list-inside mb-3 pl-4 rtl:pl-0 rtl:pr-4 space-y-1 text-on-surface-variant" {...props} />,
                            ol: ({ ...props }) => <ol className="list-decimal list-inside mb-3 pl-4 rtl:pl-0 rtl:pr-4 space-y-1 text-on-surface-variant" {...props} />,
                            li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                            table: ({ ...props }) => (
                              <div className="overflow-x-auto my-4 w-full rounded-xl border border-outline-variant/30 shadow-sm bg-surface-container-lowest/50">
                                <table className="min-w-full divide-y divide-outline-variant/30 text-xs md:text-sm" {...props} />
                              </div>
                            ),
                            thead: ({ ...props }) => <thead className="bg-surface-variant/20 font-semibold" {...props} />,
                            tbody: ({ ...props }) => <tbody className="divide-y divide-outline-variant/15" {...props} />,
                            tr: ({ ...props }) => <tr className="hover:bg-surface-variant/5 transition-colors" {...props} />,
                            th: ({ ...props }) => <th className="px-4 py-3 text-start text-on-surface-variant font-semibold border-b border-outline-variant/30" {...props} />,
                            td: ({ ...props }) => <td className="px-4 py-3 text-start text-on-surface font-normal align-top leading-normal" {...props} />,
                            blockquote: ({ ...props }) => <blockquote className="border-l-4 border-primary/50 pl-4 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-4 italic my-3 text-on-surface-variant bg-surface-variant/10 py-1 rounded-r-lg rtl:rounded-r-none rtl:rounded-l-lg" {...props} />,
                            code: ({ ...props }) => <code className="bg-surface-variant/40 px-1.5 py-0.5 rounded font-mono text-xs text-primary font-medium" {...props} />,
                            a: ({ ...props }) => <a className="text-primary hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                          }}
                        >
                          {msg.content || ''}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* AI Typing Indicator */}
              {isLoading && (
                <div className={cn(
                  'max-w-4xl mx-auto flex gap-3 md:gap-4 max-w-[85%] md:max-w-[80%] items-center',
                  isAr ? 'ml-auto flex-row' : 'mr-auto flex-row'
                )}>
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-obsidian flex items-center justify-center shrink-0 shadow-md border border-primary/10 relative overflow-hidden">
                    <Image
                      src="/images/logo.png"
                      alt="Rahal AI"
                      fill
                      sizes="40px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className={cn(
                    'bg-surface border border-outline-variant/20 flex items-center gap-1.5 px-4 py-3 rounded-2xl shadow-sm',
                    isAr ? 'rounded-tr-none' : 'rounded-tl-none'
                  )}>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Chat Input Bar */}
        <div className="p-4 md:p-6 pt-0 relative z-20">
          <div className="max-w-4xl mx-auto backdrop-blur-md bg-surface/85 border border-outline-variant/30 rounded-2xl p-2 flex items-end gap-2 md:gap-3 shadow-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
            {/* Input textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder')}
              className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm md:text-base text-on-surface py-3 px-4 resize-none max-h-32 custom-scrollbar outline-none border-none placeholder-on-surface-variant/50"
            />

            <div className="flex items-center gap-1 md:gap-2 px-1 pb-1">
              {/* Send Button */}
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="bg-primary text-white p-3 rounded-xl shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:active:scale-100 transition-all duration-200 shrink-0 flex items-center justify-center cursor-pointer"
                type="button"
                aria-label="Send message"
              >
                <Send className="w-5 h-5 rotate-0 rtl:rotate-180" />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] md:text-xs text-outline mt-3 leading-snug">
            {t('disclaimer')}
          </p>
        </div>
      </section>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}