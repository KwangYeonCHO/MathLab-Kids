'use client';

import React from 'react';
import { Problem } from '@/domain/math/types';

interface HorizontalProblemProps {
  problem: Problem;
  userAnswer?: number | null;
  userRemainder?: number | null;
  onAnswerChange?: (val: number | null) => void;
  onRemainderChange?: (val: number | null) => void;
  onFocusAnswer?: () => void;
  onFocusRemainder?: () => void;
  onSubmit?: () => void;
  isReadOnly?: boolean;
  showAnswer?: boolean;
  showExampleAnswer?: boolean;
  compact?: boolean;
  fullWidth?: boolean; // 新增：撑满整列宽度并右对齐答题框
  density?: 'normal' | 'compact' | 'dense' | 'ultra-dense';
}

function normalizeNumeric(val: string): string {
  // Convert full-width digits (０-９) to standard (0-9)
  const normalized = val.replace(/[\uFF10-\uFF19]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
  );
  return normalized.replace(/[^0-9-]/g, '');
}

export function HorizontalProblem({
  problem,
  userAnswer,
  userRemainder,
  onAnswerChange,
  onRemainderChange,
  onFocusAnswer,
  onFocusRemainder,
  onSubmit,
  isReadOnly = false,
  showAnswer,
  showExampleAnswer = false,
  compact = false,
  fullWidth = false,
  density,
}: HorizontalProblemProps) {
  const { operandA, operandB, operation, answer, remainder, isExample } = problem;

  const opSymbol = {
    addition: '+',
    subtraction: '−',
    multiplication: '×',
    division: '÷',
  }[operation];

  // 정답 노출 여부: 명시적 showAnswer가 있거나, 첫 문제 예시인 경우에만 노출
  const shouldShowAnswer = showAnswer ?? (Boolean(isExample) && Boolean(showExampleAnswer));
  const isDivisionWithRemainder = operation === 'division' && remainder !== undefined;

  const fontClass = density === 'ultra-dense'
    ? 'text-xs print:text-[11px]'
    : density === 'dense'
    ? 'text-sm sm:text-base print:text-[12.5px]'
    : compact || density === 'compact'
    ? 'text-base sm:text-lg print:text-[14px]'
    : 'text-lg sm:text-xl print:text-[16px]';

  const boxSizeClass = density === 'ultra-dense'
    ? 'w-9 h-5 print:w-8 print:h-4'
    : density === 'dense'
    ? 'w-10 h-6 print:w-9 print:h-4.5'
    : compact || density === 'compact'
    ? 'w-11 h-7 sm:w-12 sm:h-7.5 print:w-10 print:h-5.5'
    : 'w-14 h-8 sm:w-16 sm:h-9 print:w-12 print:h-7';

  const remainderBoxSizeClass = density === 'ultra-dense'
    ? 'w-7 h-5 print:w-6.5 print:h-4'
    : density === 'dense'
    ? 'w-8 h-6 print:w-7.5 print:h-4.5'
    : compact || density === 'compact'
    ? 'w-9 h-7 sm:w-10 sm:h-7.5 print:w-8.5 print:h-5.5'
    : 'w-11 h-8 sm:w-12 sm:h-9 print:w-10 print:h-7';

  const containerClass = fullWidth
    ? `w-full flex items-center justify-between flex-nowrap whitespace-nowrap font-bold text-slate-800 math-font ${fontClass}`
    : `inline-flex items-center flex-nowrap whitespace-nowrap gap-1.5 sm:gap-2 print:gap-1 font-bold text-slate-800 math-font ${fontClass}`;

  return (
    <div className={containerClass}>
      {/* 1. 왼쪽: 수식 본체 (피연산자A + 연산기호 + 피연산자B) */}
      <div className="flex items-center gap-1 sm:gap-1.5 print:gap-0.5 flex-shrink-0">
        <span className="tabular-nums">{operandA}</span>
        <span className="text-emerald-600 font-extrabold px-0.5">{opSymbol}</span>
        <span className="tabular-nums">{operandB}</span>
      </div>

      {/* 2. 오른쪽: 등호(=) + 답안 박스 (오른쪽 끝으로 완벽 정렬) */}
      <div className="flex items-center gap-1 sm:gap-1.5 print:gap-1 flex-shrink-0 ml-auto">
        <span className="text-slate-500 font-semibold px-0.5">=</span>

      {shouldShowAnswer ? (
        <div className="inline-flex items-center flex-nowrap gap-1">
          <span
            className={`px-2 py-0.5 rounded ${
              isExample
                ? 'bg-emerald-50 text-emerald-700 font-black'
                : 'text-slate-900 font-black'
            }`}
          >
            {answer}
          </span>
          {isDivisionWithRemainder && (
            <>
              <span className="text-slate-400 font-bold text-xs">…</span>
              <span
                className={`px-1.5 py-0.5 rounded ${
                  isExample
                    ? 'bg-emerald-50 text-emerald-700 font-black'
                    : 'text-slate-900 font-black'
                }`}
              >
                {remainder}
              </span>
            </>
          )}
        </div>
      ) : isReadOnly ? (
        /* 인쇄 및 학습지용 빈 답안 박스 (절대 줄바꿈 안 됨) */
        <div className="inline-flex items-center flex-nowrap gap-1 flex-shrink-0">
          <div
            className={`${boxSizeClass} border-2 border-slate-300 print:border-slate-400 rounded-md bg-slate-50/50 print:bg-white flex-shrink-0`}
          />
          {isDivisionWithRemainder && (
            <>
              <span className="text-slate-400 font-bold text-xs">…</span>
              <div
                className={`${remainderBoxSizeClass} border-2 border-slate-300 print:border-slate-400 rounded-md bg-slate-50/50 print:bg-white flex-shrink-0`}
              />
            </>
          )}
        </div>
      ) : (
        <div className="inline-flex items-center flex-nowrap gap-1.5">
          {/* 몫 또는 정답 입력 */}
          <input
            type="text"
            inputMode="numeric"
            value={userAnswer !== null && userAnswer !== undefined ? userAnswer : ''}
            onFocus={onFocusAnswer}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSubmit?.();
              }
            }}
            onChange={(e) => {
              const val = normalizeNumeric(e.target.value);
              if (val === '' || val === '-') {
                onAnswerChange?.(null);
              } else {
                const parsed = parseInt(val, 10);
                onAnswerChange?.(isNaN(parsed) ? null : parsed);
              }
            }}
            placeholder={isDivisionWithRemainder ? '몫' : '?'}
            className={`${boxSizeClass} text-center font-bold text-slate-900 bg-white border-2 border-slate-300 focus:border-emerald-500 rounded-lg outline-none transition-colors shadow-xs`}
          />

          {/* 나눗셈 나머지 입력 칸 */}
          {isDivisionWithRemainder && (
            <>
              <span className="text-slate-400 font-bold text-sm">…</span>
              <input
                type="text"
                inputMode="numeric"
                value={userRemainder !== null && userRemainder !== undefined ? userRemainder : ''}
                onFocus={onFocusRemainder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSubmit?.();
                  }
                }}
                onChange={(e) => {
                  const val = normalizeNumeric(e.target.value).replace(/[^0-9]/g, '');
                  if (val === '') {
                    onRemainderChange?.(null);
                  } else {
                    const parsed = parseInt(val, 10);
                    onRemainderChange?.(isNaN(parsed) ? null : parsed);
                  }
                }}
                placeholder="나머지"
                className={`${remainderBoxSizeClass} text-center font-bold text-slate-900 bg-white border-2 border-amber-300 focus:border-amber-500 rounded-lg outline-none transition-colors shadow-xs`}
              />
            </>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
