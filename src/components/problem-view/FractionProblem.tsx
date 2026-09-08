'use client';

import React from 'react';
import { Problem } from '@/domain/math/types';
import { FractionValue, formatFraction } from '@/domain/math/core/fraction';

interface FractionProblemProps {
  problem: Problem;
  userFraction?: FractionValue | null;
  onFractionChange?: (val: FractionValue | null) => void;
  onFocusPart?: (part: 'whole' | 'num' | 'den') => void;
  activePart?: 'whole' | 'num' | 'den';
  onSubmit?: () => void;
  isReadOnly?: boolean;
  showAnswer?: boolean;
  showExampleAnswer?: boolean;
  compact?: boolean;
  density?: 'normal' | 'compact' | 'dense' | 'ultra-dense';
  virtualKeyboard?: boolean;
}

export function FractionProblem({
  problem,
  userFraction,
  onFractionChange,
  onFocusPart,
  activePart = 'num',
  onSubmit,
  isReadOnly = false,
  showAnswer,
  showExampleAnswer = false,
  compact = false,
  density,
  virtualKeyboard = false,
}: FractionProblemProps) {
  const { operation, fractionA, fractionB, fractionAnswer, isExample } = problem;

  const opSymbol = {
    addition: '+',
    subtraction: '−',
    multiplication: '×',
    division: '÷',
  }[operation] || '+';

  const shouldShowAnswer = showAnswer ?? (Boolean(isExample) && Boolean(showExampleAnswer));

  const fA = fractionA || { numerator: 1, denominator: 2 };
  const fB = fractionB || { numerator: 1, denominator: 3 };
  const fAns = fractionAnswer || { numerator: 5, denominator: 6 };

  // 크기 조절 클래스
  const isUltraDense = density === 'ultra-dense';
  const isDense = density === 'dense' || density === 'compact' || compact;

  const wholeFontSize = isUltraDense ? 'text-xs paper:text-[11px]' : isDense ? 'text-sm paper:text-[13px]' : 'text-base sm:text-lg paper:text-[15px]';
  const fracFontSize = isUltraDense ? 'text-[10px] paper:text-[9.5px]' : isDense ? 'text-xs paper:text-[11px]' : 'text-sm sm:text-base paper:text-[13px]';

  const boxSize = isUltraDense
    ? 'w-6 h-4 text-[10px]'
    : isDense
    ? 'w-7 h-5 sm:w-8 sm:h-5 text-xs'
    : 'w-9 h-6 sm:w-10 sm:h-7 text-sm';

  const wholeBoxSize = isUltraDense
    ? 'w-8 h-4 text-[9px]'
    : isDense
    ? 'w-10 h-5 sm:w-11 sm:h-5 text-xs'
    : 'w-12 h-6 sm:w-14 sm:h-7 text-sm';

  const renderFractionDisplay = (f: FractionValue, isHighlight: boolean = false) => {
    return (
      <div className={`inline-flex items-center gap-0.5 ${isHighlight ? 'text-emerald-700 font-extrabold' : 'text-slate-800 font-bold'}`}>
        {f.whole && f.whole > 0 ? (
          <span className={`${wholeFontSize} font-bold mr-0.5`}>{f.whole}</span>
        ) : null}
        <div className="inline-flex flex-col items-center justify-center leading-none">
          <span className={`${fracFontSize} px-0.5 text-center`}>{f.numerator}</span>
          <div className="w-full h-[1.5px] bg-slate-800 my-[1px]" />
          <span className={`${fracFontSize} px-0.5 text-center`}>{f.denominator}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="inline-flex items-center flex-nowrap whitespace-nowrap gap-1.5 sm:gap-2 paper:gap-1 font-bold text-slate-800 math-font">
      {/* 1. 첫 번째 분수 */}
      {renderFractionDisplay(fA)}

      {/* 2. 연산 기호 */}
      <span className="text-emerald-600 font-extrabold px-0.5">{opSymbol}</span>

      {/* 3. 두 번째 분수 */}
      {renderFractionDisplay(fB)}

      {/* 4. 등호 (=) */}
      <span className="text-slate-500 font-semibold px-0.5">=</span>

      {/* 5. 답안 영역 */}
      {shouldShowAnswer ? (
        <div className="inline-flex items-center bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200">
          {renderFractionDisplay(fAns, true)}
        </div>
      ) : isReadOnly ? (
        /* 인쇄 학습지용 빈 분수 답안 박스 */
        <div className="inline-flex items-center gap-1">
          {fAns.whole && fAns.whole > 0 ? (
            <div className={`${boxSize} border-2 border-slate-300 rounded bg-white`} />
          ) : null}
          <div className="inline-flex flex-col items-center gap-0.5">
            <div className={`${boxSize} border-2 border-slate-300 rounded bg-white`} />
            <div className="w-full h-[1.5px] bg-slate-400" />
            <div className={`${boxSize} border-2 border-slate-300 rounded bg-white`} />
          </div>
        </div>
      ) : (
        /* 온라인 풀기용 분수 입력 인터페이스 */
        <div className="inline-flex items-center gap-1">
          {/* 자연수 부분 입력 (대분수용) */}
          <input
            type="text"
            inputMode={virtualKeyboard ? 'none' : 'numeric'}
            value={userFraction?.whole !== undefined && userFraction.whole !== null ? userFraction.whole : ''}
            onFocus={() => onFocusPart?.('whole')}
            placeholder="자연수"
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              const parsed = val ? parseInt(val, 10) : undefined;
              onFractionChange?.({
                whole: parsed,
                numerator: userFraction?.numerator || 0,
                denominator: userFraction?.denominator || 1,
              });
            }}
            className={`${wholeBoxSize} px-0.5 text-center font-bold bg-white border-2 ${
              activePart === 'whole' ? 'border-emerald-500' : 'border-slate-300'
            } rounded outline-none placeholder:text-[10px] sm:placeholder:text-xs placeholder:font-normal placeholder:text-slate-400`}
          />

          {/* 분자 / 분모 스택 */}
          <div className="inline-flex flex-col items-center gap-0.5">
            <input
              type="text"
              inputMode={virtualKeyboard ? 'none' : 'numeric'}
              value={userFraction?.numerator !== undefined && userFraction.numerator !== null ? userFraction.numerator : ''}
              onFocus={() => onFocusPart?.('num')}
              placeholder="분자"
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                const parsed = val ? parseInt(val, 10) : 0;
                onFractionChange?.({
                  whole: userFraction?.whole,
                  numerator: parsed,
                  denominator: userFraction?.denominator || 1,
                });
              }}
              className={`${boxSize} px-0.5 text-center font-bold bg-white border-2 ${
                activePart === 'num' ? 'border-emerald-500' : 'border-slate-300'
              } rounded outline-none placeholder:text-[10px] sm:placeholder:text-xs placeholder:font-normal placeholder:text-slate-400`}
            />
            <div className="w-full h-[1.5px] bg-slate-400" />
            <input
              type="text"
              inputMode={virtualKeyboard ? 'none' : 'numeric'}
              value={userFraction?.denominator !== undefined && userFraction.denominator !== null ? userFraction.denominator : ''}
              onFocus={() => onFocusPart?.('den')}
              placeholder="분모"
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                const parsed = val ? parseInt(val, 10) : 1;
                onFractionChange?.({
                  whole: userFraction?.whole,
                  numerator: userFraction?.numerator || 0,
                  denominator: parsed,
                });
              }}
              className={`${boxSize} px-0.5 text-center font-bold bg-white border-2 ${
                activePart === 'den' ? 'border-emerald-500' : 'border-slate-300'
              } rounded outline-none placeholder:text-[10px] sm:placeholder:text-xs placeholder:font-normal placeholder:text-slate-400`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
