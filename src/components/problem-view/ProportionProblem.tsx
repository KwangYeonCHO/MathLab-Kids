'use client';

import React from 'react';
import { Problem } from '@/domain/math/types';

interface ProportionProblemProps {
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

export function ProportionProblem({
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
}: ProportionProblemProps) {
  const { proportion, answer, isExample } = problem;
  const shouldShowAnswer = showAnswer ?? (Boolean(isExample) && Boolean(showExampleAnswer));

  const p = proportion || { a: 3, b: 5, c: 12, d: null, unknownPos: 'D' };

  const fontClass =
    density === 'ultra-dense'
      ? 'text-[11px] paper:text-[10px]'
      : density === 'dense'
      ? 'text-xs sm:text-sm paper:text-[12px]'
      : compact || density === 'compact'
      ? 'text-sm sm:text-base paper:text-[14px]'
      : 'text-base sm:text-lg paper:text-[16px]';

  const boxSizeClass =
    density === 'ultra-dense'
      ? 'w-7 h-5 paper:w-6 paper:h-4 text-xs'
      : density === 'dense'
      ? 'w-8 h-6 paper:w-7 paper:h-[18px] text-xs'
      : compact || density === 'compact'
      ? 'w-9 h-7 sm:w-10 sm:h-[30px] paper:w-8 paper:h-[22px] text-sm'
      : 'w-11 h-8 sm:w-12 sm:h-9 paper:w-10 paper:h-7 text-base';

  const renderSlot = (val: number | null, isUnknown: boolean) => {
    if (!isUnknown) {
      return <span className="tabular-nums">{val}</span>;
    }

    if (shouldShowAnswer) {
      return (
        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-black">
          {answer}
        </span>
      );
    }

    if (isReadOnly) {
      return (
        <div className={`${boxSizeClass} border-2 border-slate-300 paper:border-slate-400 rounded-md bg-white flex-shrink-0`} />
      );
    }

    const valStr = userAnswer !== null && userAnswer !== undefined ? String(userAnswer) : '';
    const adaptiveFont =
      valStr.length >= 4
        ? 'text-xs sm:text-sm'
        : valStr.length === 3
        ? 'text-sm sm:text-base'
        : 'text-base sm:text-lg';

    return (
      <input
        type="text"
        inputMode={virtualKeyboard ? 'none' : 'numeric'}
        value={valStr}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit?.();
        }}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9]/g, '');
          if (v === '') {
            onAnswerChange?.(null);
          } else {
            const parsed = parseInt(v, 10);
            onAnswerChange?.(isNaN(parsed) ? null : parsed);
          }
        }}
        placeholder="?"
        className={`${boxSizeClass} ${adaptiveFont} px-1 text-center font-bold text-slate-900 bg-white border-2 border-slate-300 focus:border-emerald-500 rounded-lg outline-none transition-colors shadow-xs placeholder:text-slate-400 placeholder:text-sm`}
      />
    );
  };

  return (
    <div className={`inline-flex items-center flex-nowrap whitespace-nowrap gap-1 sm:gap-1.5 paper:gap-0.5 font-bold text-slate-800 math-font ${fontClass}`}>
      {renderSlot(p.a, p.unknownPos === 'A')}
      <span className="text-slate-500 font-bold px-0.5">:</span>
      {renderSlot(p.b, p.unknownPos === 'B')}
      <span className="text-slate-500 font-bold px-1">=</span>
      {renderSlot(p.c, p.unknownPos === 'C')}
      <span className="text-slate-500 font-bold px-0.5">:</span>
      {renderSlot(p.d, p.unknownPos === 'D')}
    </div>
  );
}
