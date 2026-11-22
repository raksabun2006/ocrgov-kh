'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យ',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="p-4 sm:p-6 rounded-xl bg-[#FFEBE6] border border-[#FFBDAD] text-[#DE350B]">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
        <div className="space-y-1 flex-1">
          <h4 className="text-xs sm:text-sm font-bold font-khmer">{title}</h4>
          <p className="text-xs font-mono text-[#BF2600] break-words">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-white border border-[#FFBDAD] text-[#DE350B] hover:bg-[#FFF0B3]/30 font-khmer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ព្យាយាមម្តងទៀត (Retry)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
