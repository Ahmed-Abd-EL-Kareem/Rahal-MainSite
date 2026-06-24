import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  pill?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  pill = false,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all active:scale-95 cursor-pointer text-sm md:text-base px-6 py-2.5 md:px-8 md:py-3';
  
  const variantClasses = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container shadow-md hover:shadow-lg',
    secondary: 'border-2 border-secondary bg-transparent text-secondary hover:bg-secondary/10',
    ghost: 'bg-transparent text-on-surface hover:bg-surface-container-low',
  };

  const shapeClasses = pill ? 'rounded-full' : 'rounded-md';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], shapeClasses, widthClasses, className)}
      {...props}
    >
      {children}
    </button>
  );
}
