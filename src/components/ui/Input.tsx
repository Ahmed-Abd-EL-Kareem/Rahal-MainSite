import React from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full bg-surface-container-low border border-outline-variant/60 rounded-md px-4 py-2.5 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-primary/20 transition-all duration-200',
        className
      )}
      {...props}
    />
  );
}
