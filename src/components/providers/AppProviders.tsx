'use client';

import React from 'react';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import ThemeProvider from './ThemeProvider';
import QueryProvider from './QueryProvider';
import { AuthProvider } from './AuthProvider';

export default function AppProviders({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}