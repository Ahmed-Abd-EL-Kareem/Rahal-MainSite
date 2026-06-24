'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AITripPlannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
    if (!tokenMatch) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-container px-margin-mobile py-32 md:px-margin-desktop min-h-screen">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-on-surface">
        AI Trip Planner
      </h1>
      <p className="mt-4 font-body text-sm md:text-base text-on-surface-variant">
        Welcome to the AI Trip Planner! Design your customized, heritage-driven journey through Egypt.
      </p>
    </main>
  );
}
