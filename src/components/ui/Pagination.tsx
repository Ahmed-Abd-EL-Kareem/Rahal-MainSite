'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useLocale } from 'next-intl';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  if (totalPages <= 1) return null;

  const pages = React.useMemo(() => {
    const result: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
      return result;
    }

    result.push(1);
    
    if (currentPage > 3) result.push('ellipsis');
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    
    if (currentPage < totalPages - 2) result.push('ellipsis');
    
    result.push(totalPages);
    
    return result;
  }, [currentPage, totalPages]);

  return (
    <nav 
      className={cn('flex items-center justify-center gap-1 md:gap-2', className)}
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-primary'
        )}
        aria-label="Previous page"
      >
        <ChevronLeft size={20} className={isRtl ? 'rotate-180' : ''} />
      </button>

      {pages.map((page, index) => (
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-on-surface-variant/50">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'w-9 h-9 md:w-10 md:h-10 rounded-lg font-semibold text-sm transition-all',
              page === currentPage
                ? 'bg-primary text-on-primary shadow-md'
                : 'text-on-surface-variant hover:text-primary hover:bg-primary/10'
            )}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-primary'
        )}
        aria-label="Next page"
      >
        <ChevronRight size={20} className={isRtl ? 'rotate-180' : ''} />
      </button>
    </nav>
  );
}