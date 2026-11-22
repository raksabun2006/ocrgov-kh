'use client';

import React from 'react';

export function SkeletonCard() {
  return (
    <div className="p-4 sm:p-5 bg-white border border-[#E5EAF0] rounded-xl shadow-xs animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-24 bg-[#E5EAF0] rounded-sm" />
        <div className="h-8 w-8 bg-[#F5F7FA] rounded-lg" />
      </div>
      <div className="h-7 w-16 bg-[#E5EAF0] rounded-sm mb-2" />
      <div className="h-2.5 w-32 bg-[#F5F7FA] rounded-sm" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-[#E5EAF0] animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="py-3.5 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 bg-[#E5EAF0] rounded-md flex-shrink-0" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-44 bg-[#E5EAF0] rounded-sm" />
              <div className="h-2.5 w-28 bg-[#F5F7FA] rounded-sm" />
            </div>
          </div>
          <div className="h-5 w-24 bg-[#E5EAF0] rounded-md hidden sm:block" />
          <div className="h-5 w-20 bg-[#F5F7FA] rounded-full hidden md:block" />
          <div className="h-4 w-12 bg-[#E5EAF0] rounded-sm hidden lg:block" />
          <div className="h-7 w-16 bg-[#E5EAF0] rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonWorkspace() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
      <div className="h-[480px] bg-white border border-[#E5EAF0] rounded-xl p-4 flex flex-col justify-center items-center">
        <div className="w-12 h-12 bg-[#E5EAF0] rounded-full mb-3" />
        <div className="h-3 w-40 bg-[#E5EAF0] rounded-sm" />
      </div>
      <div className="h-[480px] bg-white border border-[#E5EAF0] rounded-xl p-4 space-y-4">
        <div className="h-8 bg-[#F5F7FA] rounded-lg w-full" />
        <div className="space-y-2 pt-4">
          <div className="h-3 bg-[#E5EAF0] rounded-sm w-full" />
          <div className="h-3 bg-[#E5EAF0] rounded-sm w-5/6" />
          <div className="h-3 bg-[#E5EAF0] rounded-sm w-4/6" />
        </div>
      </div>
    </div>
  );
}
