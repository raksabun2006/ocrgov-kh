'use client';

import React from 'react';
import { LucideIcon, FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#F5F7FA] text-[#7A869A] border border-[#E5EAF0] mb-3">
        <Icon className="w-6 h-6 stroke-1 text-[#5E6C84]" />
      </div>
      <h3 className="text-sm font-bold text-[#172B4D] font-khmer mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[#5E6C84] max-w-sm font-khmer leading-relaxed mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
