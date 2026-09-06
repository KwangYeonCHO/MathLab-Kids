'use client';

import React from 'react';
import { Problem } from '@/domain/math/types';

interface VerticalProblemProps {
  problem: Problem;
  userAnswer?: number | null;
  onAnswerChange?: (val: number | null) => void;
  onFocus?: () => void;
  onSubmit?: () => void;
  isReadOnly?: boolean;
  showAnswer?: boolean;
  showExampleAnswer?: boolean;
  compact?: boolean;
  density?: 'normal' | 'compact' | 'dense' | 'ultra-dense';
}

function normalizeNumeric(val: string): string {
  const normalized = val.replace(/[\uFF10-\uFF19]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
  );
  return normalized.replace(/[^0-9-]/g, '');
}

export function VerticalProblem({
  problem,
  userAnswer,
  onAnswerChange,
  onFocus,
  onSubmit,
  isReadOnly = false,
  showAnswer,
  showExampleAnswer = false,
  compact = false,
  density,
}: VerticalProblemProps) {
  const { operandA, operandB, operation, answer, isExample } = problem;

  const opSymbol = {
    addition: '+',
    subtraction: '−',
    multiplication: '×',
    division: '÷',
  }[operation];

  const strA = operandA.toString();
  const strB = operandB.toString();
  const maxDigits = Math.max(strA.length, strB.length, answer.toString().length);

  // 자리별 자릿수 배열 (우측 정렬용)
  const padDigits = (str: string, len: number) => {
    return str.padStart(len, ' ').split('');
  };

  const digitsA = padDigits(strA, maxDigits);
  const digitsB = padDigits(strB, maxDigits);

  // 정답 노출 여부: 명시적 showAnswer가 있거나, 첫 문제 예시인 경우에만 노출
  const shouldShowAnswer = showAnswer ?? (Boolean(isExample) && Boolean(showExampleAnswer));

  // 밀도별 폰트 크기 (A4 1장 내 30~40문제 자동 압축 대응)
  const fontClass = density === 'ultra-dense'
    ? 'text-xs print:text-[11px]'
    : density === 'dense'
    ? 'text-sm sm:text-base print:text-[12px]'
    : compact || density === 'compact'
    ? 'text-base sm:text-lg print:text-[13.5px]'
    : 'text-xl sm:text-2xl print:text-lg';

  const colWidthClass = density === 'ultra-dense'
    ? 'w-3 print:w-2.5 text-center'
    : density === 'dense'
    ? 'w-3.5 print:w-3 text-center'
    : compact || density === 'compact'
    ? 'w-4 sm:w-4.5 print:w-3.5 text-center'
    : 'w-5 sm:w-6 print:w-5 text-center';

  const cardPadding = compact || density
    ? 'p-1.5 sm:p-2 print:p-0'
    : 'p-3 sm:p-4 print:p-1';

  const answerHeight = density === 'ultra-dense'
    ? 'h-4 print:h-3.5'
    : density === 'dense'
    ? 'h-4.5 sm:h-5 print:h-4'
    : compact || density === 'compact'
    ? 'h-5.5 sm:h-6 print:h-4.5'
    : 'h-7 sm:h-8 print:h-6.5';

  const dividerClass = density === 'ultra-dense' || density === 'dense'
    ? 'w-full border-b-[1.5px] border-slate-900 my-0.5 print:my-0.5'
    : 'w-full border-b-2 border-slate-900 my-1 sm:my-1.5 print:my-0.5';

  return (
    <div
      className={`inline-block ${cardPadding} bg-white rounded-xl border border-slate-200 shadow-xs print:border-0 print:shadow-none print:bg-transparent text-slate-800`}
    >
      <div className={`flex flex-col items-end math-font ${fontClass} font-bold select-none`}>
        {/* 윗수 (피연산자 A) */}
        <div className="flex justify-end gap-1 sm:gap-1.5 print:gap-1 pr-1">
          {digitsA.map((d, i) => (
            <span key={i} className={colWidthClass}>
              {d === ' ' ? '' : d}
            </span>
          ))}
        </div>

        {/* 연산 기호 + 아랫수 (피연산자 B) */}
        <div className="flex items-center justify-end gap-1 sm:gap-1.5 print:gap-1 mt-0.5 sm:mt-1 pr-1">
          <span className="font-extrabold text-emerald-600 print:text-slate-900 mr-1 sm:mr-2">
            {opSymbol}
          </span>
          {digitsB.map((d, i) => (
            <span key={i} className={colWidthClass}>
              {d === ' ' ? '' : d}
            </span>
          ))}
        </div>

        {/* 밑줄 (구분선) */}
        <div className={dividerClass} />

        {/* 답안 영역 */}
        <div className={`w-full flex justify-end items-center ${answerHeight}`}>
          {shouldShowAnswer ? (
            <div
              className={`flex justify-end gap-1 sm:gap-1.5 print:gap-1 pr-1 ${
                isExample ? 'text-emerald-600 font-black' : 'text-slate-900 font-black'
              }`}
            >
              {padDigits(answer.toString(), maxDigits).map((d, i) => (
                <span key={i} className={colWidthClass}>
                  {d === ' ' ? '' : d}
                </span>
              ))}
            </div>
          ) : isReadOnly ? (
            /* 인쇄/학습지용 손글씨 답안 여백 */
            <div className={`w-full ${answerHeight} border-b border-dashed border-slate-200 print:border-transparent rounded-xs`} />
          ) : (
            <input
              type="text"
              inputMode="numeric"
              value={userAnswer !== null && userAnswer !== undefined ? userAnswer : ''}
              onFocus={onFocus}
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
              placeholder="?"
              className="w-full text-right font-bold text-slate-900 bg-slate-50 border-2 border-slate-300 focus:border-emerald-500 focus:bg-white rounded-lg px-2 py-0.5 outline-none transition-colors"
            />
          )}
        </div>
      </div>
    </div>
  );
}
