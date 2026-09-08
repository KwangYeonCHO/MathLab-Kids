'use client';

import React from 'react';
import { Delete, Check, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';
import { playClickSound } from '@/utils/sound';
import { useWorksheetStore } from '@/stores/worksheetStore';

interface ChildKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  allowNegative?: boolean;
  allowDecimal?: boolean;
  onToggleNegative?: () => void;
}

export function ChildKeypad({
  onDigit,
  onBackspace,
  onClear,
  onSubmit,
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
  allowNegative = false,
  allowDecimal = false,
  onToggleNegative,
}: ChildKeypadProps) {
  const { soundEnabled } = useWorksheetStore();

  const handlePress = (action: () => void) => {
    if (soundEnabled) playClickSound();
    action();
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-100 p-2 sm:p-4 rounded-2xl border border-slate-200 shadow-sm select-none">
      {/* 3x3 숫자 그리드 (1~9) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handlePress(() => onDigit(digit))}
            className="h-[42px] sm:h-14 bg-white hover:bg-slate-50 active:bg-slate-200 text-xl sm:text-3xl font-bold text-slate-800 rounded-xl shadow-2xs sm:shadow-sm border border-slate-200 active:scale-95 transition-all flex items-center justify-center math-font"
          >
            {digit}
          </button>
        ))}

        {/* 하단 행: 소수점/음수부호/전체지우기 | 0 | 백스페이스 */}
        {allowDecimal ? (
          <button
            type="button"
            onClick={() => handlePress(() => onDigit('.'))}
            title="소수점"
            className="h-[42px] sm:h-14 bg-white hover:bg-slate-50 active:bg-slate-200 text-2xl sm:text-3xl font-black text-slate-800 rounded-xl shadow-2xs sm:shadow-sm border border-slate-200 active:scale-95 transition-all flex items-center justify-center math-font"
          >
            .
          </button>
        ) : allowNegative ? (
          <button
            type="button"
            onClick={() => handlePress(() => onToggleNegative?.())}
            className="h-[42px] sm:h-14 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-2xl font-bold text-slate-700 rounded-xl shadow-2xs sm:shadow-sm transition-all flex items-center justify-center math-font"
          >
            −
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handlePress(onClear)}
            title="모두 지우기"
            className="h-[42px] sm:h-14 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 rounded-xl shadow-2xs sm:shadow-sm transition-all flex items-center justify-center gap-1 text-xs sm:text-sm font-bold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>지우기</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => handlePress(() => onDigit('0'))}
          className="h-[42px] sm:h-14 bg-white hover:bg-slate-50 active:bg-slate-200 text-xl sm:text-3xl font-bold text-slate-800 rounded-xl shadow-2xs sm:shadow-sm border border-slate-200 active:scale-95 transition-all flex items-center justify-center math-font"
        >
          0
        </button>

        <button
          type="button"
          onClick={() => handlePress(onBackspace)}
          title="한 글자 지우기"
          className="h-[42px] sm:h-14 bg-rose-100 hover:bg-rose-200 active:bg-rose-300 text-rose-700 rounded-xl shadow-2xs sm:shadow-sm transition-all flex items-center justify-center"
        >
          <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* 하단 확인 및 이동 내비게이션 행 */}
      <div className="mt-1.5 sm:mt-3">
        {onPrev || onNext ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onPrev && (
              <button
                type="button"
                onClick={() => handlePress(onPrev)}
                disabled={!canPrev}
                title="이전 문제"
                className="h-[42px] sm:h-14 px-3 sm:px-4 bg-white hover:bg-slate-50 active:bg-slate-200 disabled:opacity-35 disabled:hover:bg-white text-slate-700 font-bold rounded-xl border border-slate-300 shadow-2xs sm:shadow-sm flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-bold">이전</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handlePress(onSubmit)}
              className="flex-1 h-[42px] sm:h-14 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm sm:text-lg font-extrabold rounded-xl shadow-sm sm:shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>정답 확인</span>
            </button>

            {onNext && (
              <button
                type="button"
                onClick={() => handlePress(onNext)}
                disabled={!canNext}
                title="다음 문제"
                className="h-[42px] sm:h-14 px-3 sm:px-4 bg-white hover:bg-slate-50 active:bg-slate-200 disabled:opacity-35 disabled:hover:bg-white text-slate-700 font-bold rounded-xl border border-slate-300 shadow-2xs sm:shadow-sm flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <span className="text-xs sm:text-sm font-bold">다음</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handlePress(onSubmit)}
            className="w-full h-[42px] sm:h-14 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-base sm:text-xl font-bold rounded-xl shadow-sm sm:shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            확인
          </button>
        )}
      </div>
    </div>
  );
}
