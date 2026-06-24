'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create the QueryClient inside a useState hook to avoid sharing client state
  // across different SSR rendering requests.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // Cache items are considered fresh for 1 minute
        refetchOnWindowFocus: false, // Prevent refetching when user switches tabs
        retry: 1, // Retry failing requests once before showing error
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
