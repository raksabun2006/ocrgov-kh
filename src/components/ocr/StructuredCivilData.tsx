'use client';

import React from 'react';
import { BirthCertificateData } from '../../types/api';
import { useLanguage } from '../../lib/i18n';
import { FileBadge2, AlertTriangle } from 'lucide-react';

interface StructuredCivilDataProps {
  data: BirthCertificateData;
  documentId?: string;
}

export function StructuredCivilData({ data }: StructuredCivilDataProps) {
  const { t, language } = useLanguage();

  const fields = [
    {
      key: 'full_name_khmer',
      labelKhmer: 'គោត្តនាម និងនាម (ខ្មែរ)',
      labelEnglish: 'Full Name (Khmer)',
      value: data.full_name_khmer,
      confidence: data.field_confidences?.full_name_khmer?.confidence,
      isUncertain: data.field_confidences?.full_name_khmer?.is_uncertain,
    },
    {
      key: 'full_name_english',
      labelKhmer: 'ឈ្មោះជាឡាតាំង (English)',
      labelEnglish: 'Full Name (English / Latin)',
      value: data.full_name_english,
      confidence: data.field_confidences?.full_name_english?.confidence,
      isUncertain: data.field_confidences?.full_name_english?.is_uncertain,
    },
    {
      key: 'registration_number',
      labelKhmer: 'លេខចុះបញ្ជី / លេខសំបុត្រ',
      labelEnglish: 'Registration Certificate No.',
      value: data.registration_number,
      confidence: data.field_confidences?.registration_number?.confidence,
      isUncertain: data.field_confidences?.registration_number?.is_uncertain,
    },
    {
      key: 'date_of_birth',
      labelKhmer: 'ថ្ងៃ ខែ ឆ្នាំកំណើត',
      labelEnglish: 'Date of Birth',
      value: data.date_of_birth,
      confidence: data.field_confidences?.date_of_birth?.confidence,
      isUncertain: data.field_confidences?.date_of_birth?.is_uncertain,
    },
    {
      key: 'gender',
      labelKhmer: 'ភេទ (ប្រុស / ស្រី)',
      labelEnglish: 'Gender (Male / Female)',
      value: data.gender,
      confidence: data.field_confidences?.gender?.confidence,
      isUncertain: data.field_confidences?.gender?.is_uncertain,
    },
    {
      key: 'place_of_birth',
      labelKhmer: 'ទីកន្លែងកំណើត',
      labelEnglish: 'Place of Birth',
      value: data.place_of_birth,
      confidence: data.field_confidences?.place_of_birth?.confidence,
      isUncertain: data.field_confidences?.place_of_birth?.is_uncertain,
    },
    {
      key: 'father_name',
      labelKhmer: 'ឪពុកឈ្មោះ',
      labelEnglish: "Father's Full Name",
      value: data.father_name,
      confidence: data.field_confidences?.father_name?.confidence,
      isUncertain: data.field_confidences?.father_name?.is_uncertain,
    },
    {
      key: 'mother_name',
      labelKhmer: 'ម្តាយឈ្មោះ',
      labelEnglish: "Mother's Full Name",
      value: data.mother_name,
      confidence: data.field_confidences?.mother_name?.confidence,
      isUncertain: data.field_confidences?.mother_name?.is_uncertain,
    },
    {
      key: 'registration_date',
      labelKhmer: 'ថ្ងៃចុះបញ្ជី',
      labelEnglish: 'Registration Date',
      value: data.registration_date,
      confidence: data.field_confidences?.registration_date?.confidence,
      isUncertain: data.field_confidences?.registration_date?.is_uncertain,
    },
  ];

  return (
    <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
      {/* Civil Card Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5EAF0] bg-[#F5F7FA]">
        <div className="flex items-center gap-2">
          <FileBadge2 className="w-4 h-4 text-[#2457A7]" strokeWidth={2} />
          <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider font-khmer">
            {t.birthCertInfo}
          </h3>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EFF4FC] text-[#2457A7] border border-[#D0E0F7] font-khmer">
          ទិន្នន័យអត្រានុកូលដ្ឋាន
        </span>
      </div>

      {/* Grid of Extracted Fields */}
      <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {fields.map((field) => {
          const hasValue = field.value !== null && field.value !== undefined && field.value !== '';
          const confidence = field.confidence;

          return (
            <div
              key={field.key}
              className={`p-3 rounded-lg border transition-all ${
                field.isUncertain
                  ? 'bg-[#FFF0B3]/30 border-[#FFE58F]'
                  : 'bg-[#F5F7FA] border-[#E5EAF0]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-[#5E6C84] font-khmer truncate">
                  {language === 'km' ? field.labelKhmer : field.labelEnglish}
                </span>

                {confidence !== undefined && confidence !== null && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-sm border ${
                      confidence >= 0.8
                        ? 'bg-[#E3FCEF] text-[#00875A] border-[#ABF5D1]'
                        : 'bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]'
                    }`}
                  >
                    {(confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-sm font-semibold text-[#172B4D] font-khmer min-h-[22px]">
                {hasValue ? (
                  <span>{field.value}</span>
                ) : (
                  <span className="text-[#A5ADBA] italic font-normal text-xs">
                    មិនមានទិន្នន័យ (None)
                  </span>
                )}
              </div>

              {field.isUncertain && (
                <div className="flex items-center gap-1 mt-1 text-[10px] text-[#FF991F] font-khmer">
                  <AlertTriangle className="w-3 h-3" />
                  <span>កម្រិតទំនុកចិត្តទាប — ត្រូវការផ្ទៀងផ្ទាត់</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
