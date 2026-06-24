import React from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export default function Card({
  children,
  hoverEffect = true,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-card-rest transition-all duration-300',
        hoverEffect && 'hover:shadow-card-hover hover:border-outline-variant/75',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
