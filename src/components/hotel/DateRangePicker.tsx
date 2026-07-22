'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { fadeIn } from '@/lib/animations/variants';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from 'framer-motion';

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  minDate,
  maxDate,
  className,
  disabled = false,
}: DateRangePickerProps) {
  const t = useTranslations('hotels.room');
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn('grid grid-cols-2 gap-4', className)}
      initial={reduceMotion ? {} : { opacity: 0, y: -10 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-on-surface-variant block uppercase tracking-wider">
          {t('checkIn')}
        </label>
        <div className="relative">
          <div className="flex items-center gap-2 p-3 bg-surface-container rounded-full border-2 border-transparent focus-within:border-primary focus-within:bg-white transition-all duration-300">
            <Calendar size={14} className="text-primary shrink-0" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => onCheckInChange(e.target.value)}
              min={minDate}
              max={checkOut || maxDate}
              className="bg-transparent border-none p-0 focus:ring-0 text-on-surface w-full text-xs font-bold"
              required
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-on-surface-variant block uppercase tracking-wider">
          {t('checkOut')}
        </label>
        <div className="relative">
          <div className="flex items-center gap-2 p-3 bg-surface-container rounded-full border-2 border-transparent focus-within:border-primary focus-within:bg-white transition-all duration-300">
            <Calendar size={14} className="text-primary shrink-0" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => onCheckOutChange(e.target.value)}
              min={checkIn || minDate}
              max={maxDate}
              className="bg-transparent border-none p-0 focus:ring-0 text-on-surface w-full text-xs font-bold"
              required
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}