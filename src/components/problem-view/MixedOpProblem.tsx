'use client';

import React from 'react';
import { Problem } from '@/domain/math/types';

interface MixedOpProblemProps {
  problem: Problem;
  userAnswer?: number | null;
  onAnswerChange?: (val: number | null) => void;
  onSubmit?: () => void;
  isReadOnly?: boolean;
  showAnswer?: boolean;
  showExampleAnswer?: boolean;
  compact?: boolean;
  density?: 'normal' | 'compact' | 'dense' | 'ultra-dense';
  virtualKeyboard?: boolean;
}

export function MixedOpProblem({
  problem,
  userAnswer,
  onAnswerChange,
  onSubmit,
  isReadOnly = false,
  showAnswer,
  showExampleAnswer = false,
  compact = false,
  density,
  virtualKeyboard = false,
}: MixedOpProblemProps) {
  const { expression, answer, isExample } = problem;
  const shouldShowAnswer = showAnswer ?? (Boolean(isExample) && Boolean(showExampleAnswer));

  const fontClass =
    density === 'ultra-dense'
      ? 'text-[11px] paper:text-[10px]'
      : density === 'dense'
      ? 'text-xs sm:text-sm paper:text-[11.5px]'
      : compact || density === 'compact'
      ? 'text-sm sm:text-base paper:text-[13px]'
      : 'text-base sm:text-lg paper:text-[15px]';

  const boxSizeClass =
    density === 'ultra-dense'
      ? 'w-8 h-5 paper:w-7 paper:h-4 text-xs'
      : density === 'dense'
      ? 'w-9 h-6 paper:w-8 paper:h-[18px] text-xs'
      : compact || density === 'compact'
      ? 'w-10 h-7 sm:w-11 sm:h-[30px] paper:w-9 paper:h-[22px] text-sm'
      : 'w-12 h-8 sm:w-14 sm:h-9 paper:w-11 paper:h-7 text-base';

  return (
    <div className={`inline-flex items-center flex-nowrap whitespace-nowrap gap-1.5 sm:gap-2 paper:gap-1 font-bold text-slate-800 math-font ${fontClass}`}>
      {/* 1. 수식 문자열 */}
      <span className="tabular-nums tracking-wide">{expression || '식 없음'}</span>

      {/* 2. 등호 */}
      <span className="text-slate-500 font-semibold px-0.5">=</span>

      {/* 3. 답안 영역 */}
      {shouldShowAnswer ? (
        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-black">
          {answer}
        </span>
      ) : isReadOnly ? (
        <div className={`${boxSizeClass} border-2 border-slate-300 paper:border-slate-400 rounded-md bg-white flex-shrink-0`} />
      ) : (
        <input
          type="text"
          inputMode={virtualKeyboard ? 'none' : 'numeric'}
          value={userAnswer !== null && userAnswer !== undefined ? userAnswer : ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit?.();
          }}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9-]/g, '');
            if (val === '' || val === '-') {
              onAnswerChange?.(null);
            } else {
              const parsed = parseInt(val, 10);
              onAnswerChange?.(isNaN(parsed) ? null : parsed);
            }
          }}
          placeholder="?"
          className={`${boxSizeClass} text-center font-bold text-slate-900 bg-white border-2 border-slate-300 focus:border-emerald-500 rounded-lg outline-none transition-colors shadow-xs`}
        />
      )}
    </div>
  );
}
