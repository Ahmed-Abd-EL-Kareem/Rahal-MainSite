'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

interface HoldCountdownProps {
  expiresAt: string;
  className?: string;
  onExpire?: () => void;
}

export function HoldCountdown({ expiresAt, className, onExpire }: HoldCountdownProps) {
  const t = useTranslations('booking.hold');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;
      return Math.max(0, diff);
    };

    const initialDiff = calculateTimeLeft();
    setTimeLeft(initialDiff);
    setIsExpired(initialDiff <= 0);

    if (initialDiff <= 0) {
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      const diff = calculateTimeLeft();
      setTimeLeft(diff);
      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  if (isExpired) {
    return (
      <div className={cn('text-center py-2 text-error font-medium', className)}>
        {t('expired')}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center gap-1 text-primary font-mono text-sm font-semibold', className)}>
      <span className="w-10 text-center">{minutes.toString().padStart(2, '0')}</span>
      <span className="animate-pulse">:</span>
      <span className="w-10 text-center">{seconds.toString().padStart(2, '0')}</span>
    </div>
  );
}