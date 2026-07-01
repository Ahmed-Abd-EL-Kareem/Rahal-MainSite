'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
// import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Send,
  Plus,
  History,
  Sparkles,
  Loader2,
  Compass,
  AlertCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { aiApi } from '@/lib/api/ai';
import { usersApi } from '@/lib/api/users';
// import { tripsApi } from '@/lib/api/trips';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { Trip } from '@/types/trip';
import { Subscription } from '@/types/subscription';
import { cn } from '@/lib/utils/cn';
import type { Locale } from '@/i18n/config';
import type { ChatMessage } from '@/lib/chat/types';
import { getMessageContent, toApiMessages } from '@/lib/chat/types';

export default function AITravelChatPage() {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations('home.chatbot');

  const isAr = locale === 'ar';

  // States
  const [authLoading, setAuthLoading] = useState(true);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesHydrated, setMessagesHydrated] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'error' } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userImageError, setUserImageError] = useState(false);

  // Fetch Current User
  const { data: userData } = useQuery({
    queryKey: ["currentUser", userId],
    queryFn: () => usersApi.getUser(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const currentUser = userData?.data?.user || null;
  const userInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : "U";
  const userImage = currentUser?.image;

  // Reset image error state when user image changes
  useEffect(() => {
    setUserImageError(false);
  }, [userImage]);

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = useCallback((message: string, type: 'info' | 'error' = 'info') => {
    setToast({ message, type });
  }, []);

  // Authentication & Initial Data Fetching
  useEffect(() => {
    const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
    if (!tokenMatch) {
      router.push('/login');
    } else {
      setAuthLoading(false);
      // fetchSidebarData();

      const token = tokenMatch[2];
      if (token) {
        try {
          const payload = token.split(".")[1];
          const decoded = JSON.parse(
            atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
          );
          setUserId(decoded.id || decoded._id || decoded.sub || null);
        } catch (err) {
          console.error('Error decoding token:', err);
        }
      }
    }
  }, [router]);

  // Scroll to bottom when messages or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Toast auto-dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // const fetchSidebarData = async () => {
  //   try {
  //     const tripsRes = await tripsApi.getTrips({ limit: 5 });
  //     if (tripsRes.status === 'success') {
  //       setTrips(tripsRes.data || []);
  //     }
  //   } catch (err) {
  //     console.error('Error fetching trips:', err);
  //   } finally {
  //     setTripsLoading(false);
  //   }

  //   try {
  //     const subRes = await subscriptionsApi.getMySubscription();
  //     if (subRes.status === 'success') {
  //       setSubscription(subRes.data);
  //     }
  //   } catch (err) {
  //     console.error('Error fetching subscription:', err);
  //   }
  // };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: { [locale]: text },
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const chatRes = await aiApi.chat(toApiMessages(updatedMessages, locale));
      if (chatRes.status === 'success' && chatRes.data) {
        setMessages([
          ...updatedMessages,
          {
            role: 'assistant',
            content: { [locale]: chatRes.data.reply },
          },
        ]);

        // Refresh usage credits in UI
        if (subscription) {
          setSubscription((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              usage: {
                ...prev.usage,
                tokensUsedThisMonth:
                  prev.usage.tokensUsedThisMonth + (chatRes.data.tokensUsed || 0),
              },
            };
          });
        }
      }
    } catch (err: unknown) {
      console.error('Chat API Error:', err);
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: {
            [locale]: isAr
              ? 'عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى التحقق من رصيد النقاط والمحاولة مرة أخرى.'
              : 'Sorry, an error occurred while connecting to the server. Please check your credit balance and try again.',
          },
        },
      ]);
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
    if (messages.length === 0) return;
    setMessages([]);
    showToast(t('newChatStarted'));
  }


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

  // Token limits calculations
  const tokensUsed = subscription?.usage?.tokensUsedThisMonth ?? 0;
  const tokensLimit = subscription?.plan?.limits?.tokensPerMonth ?? 15000;
  const isUnlimited = tokensLimit === null;
  const usagePercentage = isUnlimited ? 0 : Math.min(100, Math.round((tokensUsed / tokensLimit) * 100));

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

      {/* Left Sidebar: Chat History & Token usage */}
      <aside className="hidden md:flex w-80 flex-col border-r border-outline-variant/20 bg-surface-container-low/50 overflow-hidden shrink-0">
        {/* New Itinerary Button */}
        <div className="p-6">
          <button
            onClick={handleNewChat}
            disabled={messages.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-lg hover:scale-[0.98] disabled:opacity-55 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            {t('newChat')}
          </button>
        </div>

        {/* Recent Plans (Trips) list */}
        {/* <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-2">
          <div className="px-2 py-1 text-xs font-semibold text-outline uppercase tracking-wider">
            {t('recentPlans')}
          </div>
          {tripsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-outline" />
            </div>
          ) : trips.length === 0 ? (
            <div className="text-xs text-on-surface-variant/60 px-2 py-4">
              {isAr ? 'لا توجد رحلات مخططة بعد.' : 'No trips planned yet.'}
            </div>
          ) : (
            <div className="space-y-1">
              {trips.map((trip) => (
                <Link
                  key={trip._id}
                  href={`/planner/${trip._id}`}
                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-surface-variant/40 text-on-surface-variant hover:text-primary transition-all duration-200"
                >
                  <History className="w-4 h-4 text-outline group-hover:text-primary shrink-0" />
                  <span className="text-sm font-medium truncate flex-1">{trip.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div> */}

        {/* Token Usage / AI Credits */}
        <div className="p-6 border-t border-outline-variant/20 bg-surface-container-lowest/30">
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
                      "flex gap-3 md:gap-4 max-w-[85%] md:max-w-[80%]",
                      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md relative overflow-hidden",
                        isUser
                          ? "bg-primary/20 text-primary border border-primary/20"
                          : "bg-obsidian text-primary border border-primary/10"
                      )}
                    >
                      {isUser ? (
                        userImage && !userImageError ? (
                          <Image
                            src={userImage}
                            alt={currentUser?.name || "User"}
                            fill
                            className="object-cover"
                            onError={() => setUserImageError(true)}
                          />
                        ) : (
                          <span className="text-sm md:text-base font-bold text-primary">
                            {userInitial}
                          </span>
                        )
                      ) : (
                        <Image
                          src="/images/logo.png"
                          alt="Rahal AI"
                          fill
                          className="object-contain p-1.5"
                        />
                      )}
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={cn(
                        "p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm",
                        isUser
                          ? "bg-primary text-white rounded-tr-none whitespace-pre-wrap"
                          : "bg-surface border border-outline-variant/20 text-on-surface rounded-tl-none prose dark:prose-invert max-w-none"
                      )}
                    >
                      {isUser ? (
                        getMessageContent(msg, locale)
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-lg md:text-xl font-bold mt-4 mb-2 text-primary" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-base md:text-lg font-semibold mt-3.5 mb-2 text-primary" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-sm md:text-base font-semibold mt-3 mb-1.5 text-on-surface" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-3 last:mb-0 leading-relaxed text-on-surface-variant" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 pl-4 rtl:pl-0 rtl:pr-4 space-y-1 text-on-surface-variant" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 pl-4 rtl:pl-0 rtl:pr-4 space-y-1 text-on-surface-variant" {...props} />,
                            li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                            table: ({ node, ...props }) => (
                              <div className="overflow-x-auto my-4 w-full rounded-xl border border-outline-variant/30 shadow-sm bg-surface-container-lowest/50">
                                <table className="min-w-full divide-y divide-outline-variant/30 text-xs md:text-sm" {...props} />
                              </div>
                            ),
                            thead: ({ node, ...props }) => <thead className="bg-surface-variant/20 font-semibold" {...props} />,
                            tbody: ({ node, ...props }) => <tbody className="divide-y divide-outline-variant/15" {...props} />,
                            tr: ({ node, ...props }) => <tr className="hover:bg-surface-variant/5 transition-colors" {...props} />,
                            th: ({ node, ...props }) => <th className="px-4 py-3 text-start text-on-surface-variant font-semibold border-b border-outline-variant/30" {...props} />,
                            td: ({ node, ...props }) => <td className="px-4 py-3 text-start text-on-surface font-normal align-top leading-normal" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/50 pl-4 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-4 italic my-3 text-on-surface-variant bg-surface-variant/10 py-1 rounded-r-lg rtl:rounded-r-none rtl:rounded-l-lg" {...props} />,
                            code: ({ node, ...props }) => <code className="bg-surface-variant/40 px-1.5 py-0.5 rounded font-mono text-xs text-primary font-medium" {...props} />,
                            a: ({ node, ...props }) => <a className="text-primary hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                          }}
                        >
                          {getMessageContent(msg, locale) || ''}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* AI Typing Indicator */}
          {isLoading && (
            <div className="max-w-4xl mx-auto flex gap-3 md:gap-4 max-w-[85%] md:max-w-[80%] items-center mr-auto">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-obsidian flex items-center justify-center shrink-0 shadow-md border border-primary/10 relative overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="Rahal AI"
                  fill
                  className="object-contain p-1.5"
                />
              </div>
              <div className="bg-surface border border-outline-variant/20 flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
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
    </div>
  );
}
