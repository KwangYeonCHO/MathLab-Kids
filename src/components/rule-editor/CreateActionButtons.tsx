'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWorksheetStore } from '@/stores/worksheetStore';
import { Play, Printer } from 'lucide-react';

interface CreateActionButtonsProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function CreateActionButtons({ className = '', size = 'md' }: CreateActionButtonsProps) {
  const router = useRouter();
  const { generateNewProblems, startPractice } = useWorksheetStore();

  const handleStartPractice = () => {
    const success = generateNewProblems();
    if (success) {
      startPractice();
      router.push('/practice');
    }
  };

  const handleGoToPrint = () => {
    const success = generateNewProblems();
    if (success) {
      router.push('/print');
    }
  };

  const isSmall = size === 'sm';

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <button
        type="button"
        onClick={handleGoToPrint}
        className={`rounded-xl border border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 ${
          isSmall ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-xs sm:text-sm'
        }`}
        title="선택한 조건으로 문제 인쇄 페이지로 이동"
      >
        <Printer className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>인쇄하기</span>
      </button>

      <button
        type="button"
        onClick={handleStartPractice}
        className={`rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 ${
          isSmall ? 'px-3.5 py-2 text-xs' : 'px-4 sm:px-5 py-2.5 text-xs sm:text-sm'
        }`}
        title="선택한 조건으로 온라인 풀기 시작"
      >
        <Play className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} fill-current`} />
        <span>온라인으로 풀기</span>
      </button>
    </div>
  );
}
