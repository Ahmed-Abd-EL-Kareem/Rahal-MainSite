'use client';

import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface OTPInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  className?: string;
}

interface OTPInputRef {
  focus: () => void;
}

export const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(
  ({ length = 6, value, onChange, disabled = false, error = false, autoFocus = true, className }, ref) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRefs.current[0]?.focus(),
    }));

    useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, [autoFocus]);

    const handleChange = (val: string, index: number) => {
      const cleanVal = val.replace(/[^0-9]/g, '');
      const newValue = [...value];
      newValue[index] = cleanVal[cleanVal.length - 1] || '';
      onChange(newValue);

      if (cleanVal && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Backspace') {
        if (!value[index] && index > 0) {
          const newValue = [...value];
          newValue[index - 1] = '';
          onChange(newValue);
          inputRefs.current[index - 1]?.focus();
        } else {
          const newValue = [...value];
          newValue[index] = '';
          onChange(newValue);
        }
        e.preventDefault();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').substring(0, length);
      if (pasteData) {
        const newValue = pasteData.split('').concat(Array(length - pasteData.length).fill(''));
        onChange(newValue);
        inputRefs.current[Math.min(pasteData.length, length - 1)]?.focus();
      }
    };

    return (
      <div
        ref={containerRef}
        className={cn('flex justify-center gap-2 md:gap-3', className)}
        dir="ltr"
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index]}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            placeholder="·"
            disabled={disabled}
            autoComplete="one-time-code"
            className={cn(
              'w-12 h-12 md:w-14 md:h-14 text-center text-2xl font-bold',
              'bg-surface-container-low border-2 rounded-xl transition-all duration-200',
              'text-on-surface placeholder-on-surface-variant/50',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              disabled && 'opacity-50 cursor-not-allowed',
              error && 'border-error focus:border-error focus:ring-error/20'
            )}
          />
        ))}
      </div>
    );
  }
);

OTPInput.displayName = 'OTPInput';