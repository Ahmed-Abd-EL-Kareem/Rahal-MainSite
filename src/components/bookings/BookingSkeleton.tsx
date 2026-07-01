import React from 'react';

export default function BookingSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm p-6 animate-pulse">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Thumbnail placeholder */}
        <div className="w-full md:w-1/3 h-48 md:h-36 bg-surface-container rounded-lg"></div>
        
        {/* Right Side: Info placeholder */}
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="h-6 w-1/2 bg-surface-container rounded"></div>
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-surface-container rounded-full"></div>
                <div className="h-5 w-12 bg-surface-container rounded-full"></div>
              </div>
            </div>
            <div className="h-4 w-1/4 bg-surface-container rounded mb-4"></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="h-3 w-12 bg-surface-container rounded mb-1"></div>
                <div className="h-4 w-24 bg-surface-container rounded"></div>
              </div>
              <div>
                <div className="h-3 w-12 bg-surface-container rounded mb-1"></div>
                <div className="h-4 w-16 bg-surface-container rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4 mt-auto">
            <div>
              <div className="h-3 w-16 bg-surface-container rounded mb-1"></div>
              <div className="h-6 w-20 bg-surface-container rounded"></div>
            </div>
            <div className="h-10 w-28 bg-surface-container rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
