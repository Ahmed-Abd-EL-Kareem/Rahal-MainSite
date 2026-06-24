import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'error';
  pill?: boolean;
}

export default function Badge({
  children,
  variant = 'primary',
  pill = true,
  className,
  ...props
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
    outline: 'border border-outline text-on-surface-variant',
    success: 'bg-success/10 text-success',
    error: 'bg-error/10 text-error',
  };

  const shapeClasses = pill ? 'rounded-full' : 'rounded-sm';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold',
        variantClasses[variant],
        shapeClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
