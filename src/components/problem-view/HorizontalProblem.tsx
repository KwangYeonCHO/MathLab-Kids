'use client';

import React from 'react';
import { Problem } from '@/domain/math/types';

interface HorizontalProblemProps {
  problem: Problem;
  userAnswer?: number | null;
  userRemainder?: number | null;
  rawInput?: string;
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
  virtualKeyboard?: boolean;
}

function normalizeNumeric(val: string, allowDecimal = false): string {
  // Convert full-width digits (０-９) to standard (0-9)
  const normalized = val.replace(/[\uFF10-\uFF19]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
  );
  if (allowDecimal) {
    return normalized.replace(/[^0-9.-]/g, '');
  }
  return normalized.replace(/[^0-9-]/g, '');
}

export function HorizontalProblem({
  problem,
  userAnswer,
  userRemainder,
  rawInput,
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
  virtualKeyboard = false,
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
    ? 'text-xs paper:text-[11px]'
    : density === 'dense'
    ? 'text-sm sm:text-base paper:text-[12.5px]'
    : compact || density === 'compact'
    ? 'text-base sm:text-lg paper:text-[14px]'
    : 'text-lg sm:text-xl paper:text-[16px]';

  const boxSizeClass = density === 'ultra-dense'
    ? 'w-9 h-5 paper:w-8 paper:h-4'
    : density === 'dense'
    ? 'w-10 h-6 paper:w-9 paper:h-[18px]'
    : compact || density === 'compact'
    ? 'w-12 h-7 sm:w-14 sm:h-[30px] paper:w-10 paper:h-[22px]'
    : 'w-14 h-8 sm:w-16 sm:h-9 paper:w-12 paper:h-7';

  const remainderBoxSizeClass = density === 'ultra-dense'
    ? 'w-9 h-5 paper:w-8 paper:h-4'
    : density === 'dense'
    ? 'w-10 h-6 paper:w-9 paper:h-[18px]'
    : compact || density === 'compact'
    ? 'w-12 h-7 sm:w-14 sm:h-[30px] paper:w-10 paper:h-[22px]'
    : 'w-14 h-8 sm:w-16 sm:h-9 paper:w-12 paper:h-7';

  // 입력값 길이 및 상자 크기에 따라 폰트 크기를 지능적으로 자동 조정 (글자가 상자 밖으로 넘치지 않도록 방지)
  const getAdaptiveFontClass = (text: string, isRemainder: boolean = false) => {
    const len = text ? text.length : isRemainder ? 3 : 1;
    if (density === 'ultra-dense') {
      return len >= 3 ? 'text-[9px]' : 'text-[10px]';
    }
    if (density === 'dense') {
      return len >= 3 ? 'text-[10px]' : len === 2 ? 'text-xs' : 'text-xs';
    }
    if (compact || density === 'compact') {
      return len >= 4 ? 'text-[10px]' : len >= 3 ? 'text-xs' : len === 2 ? 'text-xs sm:text-sm' : 'text-sm sm:text-base';
    }
    // 일반 모드 (Normal Mode)
    if (len >= 5) {
      return 'text-[11px] sm:text-xs';
    }
    if (len >= 4) {
      return 'text-xs sm:text-sm';
    }
    if (len === 3) {
      return 'text-xs sm:text-sm'; // 3글자 ('나머지', '0.9', '125' 등)는 12px~14px로 여유 있게 맞춤
    }
    if (len === 2) {
      return 'text-sm sm:text-base';
    }
    return 'text-base sm:text-lg'; // 1글자 ('몫', '?', '5' 등)는 16px~18px
  };

  const answerDisplayValue =
    rawInput !== undefined && rawInput !== ''
      ? String(rawInput)
      : userAnswer !== null && userAnswer !== undefined
      ? String(userAnswer)
      : '';

  const remainderDisplayValue =
    userRemainder !== null && userRemainder !== undefined
      ? String(userRemainder)
      : '';

  const containerClass = fullWidth
    ? `w-full flex items-center justify-between flex-nowrap whitespace-nowrap font-bold text-slate-800 math-font ${fontClass}`
    : `inline-flex items-center flex-nowrap whitespace-nowrap gap-1.5 sm:gap-2 paper:gap-1 font-bold text-slate-800 math-font ${fontClass}`;

  return (
    <div className={containerClass}>
      {/* 1. 왼쪽: 수식 본체 (피연산자A + 연산기호 + 피연산자B) */}
      <div className="flex items-center gap-1 sm:gap-1.5 paper:gap-0.5 flex-shrink-0">
        <span className="tabular-nums">{operandA}</span>
        <span className="text-emerald-600 font-extrabold px-0.5">{opSymbol}</span>
        <span className="tabular-nums">{operandB}</span>
      </div>

      {/* 2. 오른쪽: 등호(=) + 답안 박스 */}
      <div className={`flex items-center gap-1 sm:gap-1.5 paper:gap-1 flex-shrink-0 ${fullWidth ? 'ml-auto' : ''}`}>
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
            className={`${boxSizeClass} border-2 border-slate-300 paper:border-slate-400 rounded-md bg-slate-50/50 paper:bg-white flex-shrink-0`}
          />
          {isDivisionWithRemainder && (
            <>
              <span className="text-slate-400 font-bold text-xs">…</span>
              <div
                className={`${remainderBoxSizeClass} border-2 border-slate-300 paper:border-slate-400 rounded-md bg-slate-50/50 paper:bg-white flex-shrink-0`}
              />
            </>
          )}
        </div>
      ) : (
        <div className="inline-flex items-center flex-nowrap gap-1.5">
          {/* 몫 또는 정답 입력 */}
          <input
            type="text"
            inputMode={virtualKeyboard ? 'none' : 'numeric'}
            value={answerDisplayValue}
            onFocus={onFocusAnswer}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSubmit?.();
              }
            }}
            onChange={(e) => {
              const isDecimal = problem.category === 'decimal';
              const val = normalizeNumeric(e.target.value, isDecimal);
              if (val === '' || val === '-') {
                onAnswerChange?.(null);
              } else {
                const parsed = isDecimal ? parseFloat(val) : parseInt(val, 10);
                onAnswerChange?.(isNaN(parsed) ? null : parsed);
              }
            }}
            placeholder={isDivisionWithRemainder ? '몫' : '?'}
            className={`${boxSizeClass} ${getAdaptiveFontClass(answerDisplayValue, false)} px-1 text-center font-bold text-slate-900 bg-white border-2 border-slate-300 focus:border-emerald-500 rounded-lg outline-none transition-colors shadow-xs placeholder:text-slate-400 placeholder:font-bold placeholder:text-xs sm:placeholder:text-sm`}
          />

          {/* 나눗셈 나머지 입력 칸 */}
          {isDivisionWithRemainder && (
            <>
              <span className="text-slate-400 font-bold text-sm">…</span>
              <input
                type="text"
                inputMode={virtualKeyboard ? 'none' : 'numeric'}
                value={remainderDisplayValue}
                onFocus={onFocusRemainder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSubmit?.();
                  }
                }}
                onChange={(e) => {
                  const val = normalizeNumeric(e.target.value).replace(/[^0-9.]/g, '');
                  if (val === '') {
                    onRemainderChange?.(null);
                  } else {
                    const parsed = problem.category === 'decimal' ? parseFloat(val) : parseInt(val, 10);
                    onRemainderChange?.(isNaN(parsed) ? null : parsed);
                  }
                }}
                placeholder="나머지"
                className={`${remainderBoxSizeClass} ${getAdaptiveFontClass(remainderDisplayValue, true)} px-1 text-center font-bold text-slate-900 bg-white border-2 border-amber-300 focus:border-amber-500 rounded-lg outline-none transition-colors shadow-xs placeholder:text-amber-600/70 placeholder:font-bold placeholder:text-[11px] sm:placeholder:text-xs`}
              />
            </>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
