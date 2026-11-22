'use client';

import React from 'react';
import { Files, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { SkeletonCard } from '../ui/LoadingSkeleton';

interface StatsCardsProps {
  total: number;
  processed: number;
  pending: number;
  failed: number;
  isLoading?: boolean;
}

export function StatsCards({
  total,
  processed,
  pending,
  failed,
  isLoading,
}: StatsCardsProps) {
  const { t, language } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const cards = [
    {
      title: t.totalDocuments,
      value: total,
      sub: language === 'km' ? 'ឯកសារក្នុងបណ្ណសារ' : 'Archived in system',
      icon: Files,
      color: 'text-[#2457A7]',
      borderColor: 'border-[#E5EAF0]',
      badgeBg: 'bg-[#EFF4FC]',
    },
    {
      title: t.processedDocs,
      value: processed,
      sub: language === 'km' ? 'ដំណើរការ OCR ជោគជ័យ' : 'Verified & extracted',
      icon: CheckCircle2,
      color: 'text-[#00875A]',
      borderColor: 'border-[#E5EAF0]',
      badgeBg: 'bg-[#E3FCEF]',
    },
    {
      title: t.pendingDocs,
      value: pending,
      sub: language === 'km' ? 'រង់ចាំផ្ទៀងផ្ទាត់' : 'Awaiting review',
      icon: Clock,
      color: 'text-[#FF991F]',
      borderColor: 'border-[#E5EAF0]',
      badgeBg: 'bg-[#FFF0B3]',
    },
    {
      title: t.failedDocs,
      value: failed,
      sub: language === 'km' ? 'ឯកសារមិនទាន់ចាត់ថ្នាក់' : 'Unclassified records',
      icon: AlertCircle,
      color: 'text-[#DE350B]',
      borderColor: 'border-[#E5EAF0]',
      badgeBg: 'bg-[#FFEBE6]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-3.5 sm:p-5 bg-white border ${card.borderColor} rounded-xl shadow-xs transition-all hover:shadow-sm`}
          >
            <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-[#5E6C84] font-khmer truncate">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.badgeBg} flex-shrink-0`}>
                <Icon className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${card.color}`} strokeWidth={2} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-[#172B4D] font-mono tracking-tight">
                {card.value}
              </span>
            </div>

            <p className="text-[10px] sm:text-[11px] text-[#7A869A] mt-0.5 sm:mt-1 truncate font-khmer">
              {card.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}
