'use client';

import React from 'react';
import { Delete, Check, RotateCcw } from 'lucide-react';
import { playClickSound } from '@/utils/sound';
import { useWorksheetStore } from '@/stores/worksheetStore';

interface ChildKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  allowNegative?: boolean;
  onToggleNegative?: () => void;
}

export function ChildKeypad({
  onDigit,
  onBackspace,
  onClear,
  onSubmit,
  allowNegative = false,
  onToggleNegative,
}: ChildKeypadProps) {
  const { soundEnabled } = useWorksheetStore();

  const handlePress = (action: () => void) => {
    if (soundEnabled) playClickSound();
    action();
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-100 p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-md select-none">
      {/* 3x3 숫자 그리드 (1~9) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handlePress(() => onDigit(digit))}
            className="h-14 sm:h-16 bg-white hover:bg-slate-50 active:bg-slate-200 text-2xl sm:text-3xl font-bold text-slate-800 rounded-xl shadow-sm border border-slate-200 active:scale-95 transition-all flex items-center justify-center math-font"
          >
            {digit}
          </button>
        ))}

        {/* 하단 행: 음수부호/전체지우기 | 0 | 백스페이스 */}
        {allowNegative ? (
          <button
            type="button"
            onClick={() => handlePress(() => onToggleNegative?.())}
            className="h-14 sm:h-16 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-2xl font-bold text-slate-700 rounded-xl shadow-sm transition-all flex items-center justify-center math-font"
          >
            −
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handlePress(onClear)}
            title="모두 지우기"
            className="h-14 sm:h-16 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-600 rounded-xl shadow-sm transition-all flex flex-col items-center justify-center text-xs font-semibold"
          >
            <RotateCcw className="w-5 h-5 mb-0.5" />
            지우기
          </button>
        )}

        <button
          type="button"
          onClick={() => handlePress(() => onDigit('0'))}
          className="h-14 sm:h-16 bg-white hover:bg-slate-50 active:bg-slate-200 text-2xl sm:text-3xl font-bold text-slate-800 rounded-xl shadow-sm border border-slate-200 active:scale-95 transition-all flex items-center justify-center math-font"
        >
          0
        </button>

        <button
          type="button"
          onClick={() => handlePress(onBackspace)}
          title="한 글자 지우기"
          className="h-14 sm:h-16 bg-rose-100 hover:bg-rose-200 active:bg-rose-300 text-rose-700 rounded-xl shadow-sm transition-all flex items-center justify-center"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      {/* 하단 확인 버튼 */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => handlePress(onSubmit)}
          className="w-full h-14 sm:h-16 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xl font-bold rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-6 h-6 stroke-[3]" />
          확인
        </button>
      </div>
    </div>
  );
}
