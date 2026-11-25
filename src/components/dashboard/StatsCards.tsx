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

  const processedPercent = total > 0 ? Math.round((processed / total) * 100) : 0;
  const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;
  const failedPercent = total > 0 ? Math.max(0, 100 - processedPercent - pendingPercent) : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-4 sm:p-5 bg-white border ${card.borderColor} rounded-xl shadow-[0_1px_3px_rgba(9,30,66,0.04)] transition-all hover:border-[#D0E0F7]`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-2.5">
                <span className="text-[11px] sm:text-xs font-semibold text-[#5E6C84] font-khmer truncate">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg ${card.badgeBg} flex-shrink-0`}>
                  <Icon className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${card.color}`} strokeWidth={2} />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#172B4D] font-mono tracking-tight">
                  {card.value}
                </span>
                {total > 0 && idx > 0 && (
                  <span className="text-[11px] font-mono text-[#5E6C84]">
                    ({idx === 1 ? processedPercent : idx === 2 ? pendingPercent : failedPercent}%)
                  </span>
                )}
              </div>

              <p className="text-[10px] sm:text-[11px] text-[#7A869A] mt-1 truncate font-khmer">
                {card.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Visual Distribution Bar */}
      {total > 0 && (
        <div className="bg-white border border-[#E5EAF0] rounded-xl p-3 sm:px-4 sm:py-3 shadow-[0_1px_2px_rgba(9,30,66,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#5E6C84]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#172B4D] font-khmer text-xs">
              {language === 'km' ? 'អត្រាដំណើរការឯកសារ:' : 'Processing Ratio:'}
            </span>
            <span className="font-mono text-[#00875A] font-bold text-xs">{processedPercent}% ជោគជ័យ</span>
          </div>

          <div className="flex-1 max-w-md w-full bg-[#EFF4FC] h-2.5 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${processedPercent}%` }}
              className="bg-[#00875A] h-full transition-all duration-500"
              title={`Processed: ${processedPercent}%`}
            />
            <div
              style={{ width: `${pendingPercent}%` }}
              className="bg-[#FF991F] h-full transition-all duration-500"
              title={`Pending: ${pendingPercent}%`}
            />
            <div
              style={{ width: `${failedPercent}%` }}
              className="bg-[#DE350B] h-full transition-all duration-500"
              title={`Unclassified: ${failedPercent}%`}
            />
          </div>

          <div className="flex items-center gap-3 text-[11px] font-khmer">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00875A]" />
              <span>ជោគជ័យ</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FF991F]" />
              <span>រង់ចាំ</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#DE350B]" />
              <span>មិនទាន់កំណត់</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
