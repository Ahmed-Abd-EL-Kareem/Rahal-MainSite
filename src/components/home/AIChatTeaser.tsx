'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Bot, Languages, Landmark, Send, Sparkles } from 'lucide-react';
import Heading from '../ui/Heading';
import Text from '../ui/Text';

export default function AIChatTeaser() {
  const t = useTranslations('home.chatbot');

  const bullets = [
    {
      icon: <Bot className="w-6 h-6 text-primary" />,
      title: t('bullet1Title'),
      desc: t('bullet1Desc'),
    },
    {
      icon: <Languages className="w-6 h-6 text-primary" />,
      title: t('bullet2Title'),
      desc: t('bullet2Desc'),
    },
    {
      icon: <Landmark className="w-6 h-6 text-primary" />,
      title: t('bullet3Title'),
      desc: t('bullet3Desc'),
    },
  ];

  return (
    <section className="py-24 bg-secondary text-white overflow-hidden">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        {/* Left Info Column */}
        <div className="flex flex-col items-start">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
            {t('subtitle')}
          </span>
          <Heading level={2} variant="headline-md" className="text-white mt-4 mb-8">
            {t('title')}
          </Heading>
          
          <div className="space-y-6 w-full">
            {bullets.map((b, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-12 h-12 flex-shrink-0 bg-white/10 rounded-full flex items-center justify-center">
                  {b.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-white mb-1">{b.title}</h4>
                  <p className="text-white/70 text-sm md:text-base">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Phone Mockup Column */}
        <div className="relative flex justify-center w-full">
          {/* Phone Shell */}
          <div className="w-[320px] h-[600px] bg-[#141008] rounded-[2.5rem] border-[8px] border-white/20 shadow-2xl relative overflow-hidden flex flex-col">
            {/* Speaker/Camera Notch */}
            <div className="absolute top-0 left-0 w-full h-6 bg-[#141008] flex justify-center items-end pb-1 z-35">
              <div className="w-16 h-3.5 bg-black rounded-full" />
            </div>

            {/* Screen Content */}
            <div className="flex-1 flex flex-col bg-surface pt-10 pb-6 px-4">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-outline-variant/20">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="font-bold text-sm text-on-surface leading-none">{t('mockName')}</div>
                  <div className="text-[10px] text-success font-semibold mt-1">{t('mockStatus')}</div>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
                {/* AI Msg 1 */}
                <div className="bg-surface-container-low border border-outline-variant/10 p-3 rounded-2xl rounded-tl-none text-xs text-on-surface-variant max-w-[85%] self-start">
                  {t('mockMsg1')}
                </div>

                {/* User Msg 2 */}
                <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-none text-xs max-w-[85%] self-end">
                  {t('mockMsg2')}
                </div>

                {/* AI Msg 3 */}
                <div className="bg-surface-container-low border border-outline-variant/10 p-3 rounded-2xl rounded-tl-none text-xs text-on-surface-variant max-w-[85%] self-start">
                  {t('mockMsg3')}
                </div>
              </div>

              {/* Input Area */}
              <div className="mt-4 pt-3 border-t border-outline-variant/25">
                <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-full px-4 py-2.5 flex justify-between items-center text-xs text-on-surface-variant">
                  <span>{t('mockPlaceholder')}</span>
                  <Send size={14} className="text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Sparkle decorative */}
          <div className="absolute -top-6 -right-6 animate-pulse hidden md:block">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
        </div>
      </div>
    </section>
  );
}
