'use client';

import React from 'react';
import { Files, CheckCircle2, Clock, Cpu } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { HealthResponse } from '../../types/api';

interface StatsCardsProps {
  total: number;
  processed: number;
  pending: number;
  failed: number;
  health: HealthResponse | null;
}

export function StatsCards({
  total,
  processed,
  pending,
  failed,
  health,
}: StatsCardsProps) {
  const { t, language } = useLanguage();

  const cards = [
    {
      title: t.totalDocuments,
      value: total,
      sub: language === 'km' ? 'ឯកសារក្នុងបណ្ណសារ' : 'Archived in system',
      icon: Files,
      color: 'text-[#17365D]',
      borderColor: 'border-[#E2E8F0]',
    },
    {
      title: t.processedDocs,
      value: processed,
      sub: language === 'km' ? 'ដំណើរការជោគជ័យ' : 'Verified & extracted',
      icon: CheckCircle2,
      color: 'text-[#16A34A]',
      borderColor: 'border-[#E2E8F0]',
    },
    {
      title: t.pendingDocs,
      value: pending,
      sub: language === 'km' ? 'រង់ចាំផ្ទៀងផ្ទាត់' : 'Awaiting review',
      icon: Clock,
      color: 'text-[#D97706]',
      borderColor: 'border-[#E2E8F0]',
    },
    {
      title: language === 'km' ? 'ម៉ាស៊ីន OCR' : 'Dual OCR Engine',
      value: health?.ocr_engine?.ready ? 'Ready' : 'Online',
      sub: health?.ocr_engine?.languages
        ? `Languages: ${health.ocr_engine.languages.join(' + ')}`
        : 'Khmer + English (khm+eng)',
      icon: Cpu,
      color: 'text-[#2563A6]',
      borderColor: 'border-[#E2E8F0]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-3 sm:p-5 bg-white border ${card.borderColor} rounded-xl shadow-xs transition-shadow hover:shadow-sm`}
          >
            <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-[#64748B] font-khmer truncate">
                {card.title}
              </span>
              <div className="p-1.5 sm:p-2 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9] flex-shrink-0">
                <Icon className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${card.color}`} strokeWidth={2} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-[#1E293B] font-mono tracking-tight">
                {card.value}
              </span>
            </div>

            <p className="text-[10px] sm:text-[11px] text-[#64748B] mt-0.5 sm:mt-1 truncate font-khmer">
              {card.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}
