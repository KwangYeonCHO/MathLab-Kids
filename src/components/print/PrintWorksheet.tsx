'use client';

import React from 'react';
import { Problem, WorksheetRule, DisplayFormat } from '@/domain/math/types';
import { VerticalProblem } from '../problem-view/VerticalProblem';
import { HorizontalProblem } from '../problem-view/HorizontalProblem';

export type PrintDensity = 'normal' | 'compact' | 'dense' | 'ultra-dense';

export function getAutoColumns(
  problemCount: number,
  displayFormat?: DisplayFormat
): 2 | 3 | 4 | 5 | 6 {
  if (displayFormat === 'vertical') {
    if (problemCount <= 12) return 3;
    if (problemCount <= 24) return 4;
    if (problemCount <= 40) return 5; // 25, 30, 35, 40 -> 5열 배치가 가장 탁월함
    return 6; // 40문제 초과 시 6열
  } else {
    // horizontal
    if (problemCount <= 12) return 2;
    if (problemCount <= 24) return 3;
    if (problemCount <= 40) return 4;
    return 5;
  }
}

export function calculatePrintDensity(
  problemCount: number,
  effectiveColumns: number
): PrintDensity {
  const rowCount = Math.ceil(problemCount / effectiveColumns);
  if (rowCount <= 5) return 'normal';
  if (rowCount === 6) return 'compact';
  if (rowCount <= 8) return 'dense'; // 30문제 4열(8행) 등
  return 'ultra-dense'; // 40~50문제 등 초고밀도
}

interface PrintWorksheetProps {
  rule: WorksheetRule;
  problems: Problem[];
  columns?: 'auto' | 2 | 3 | 4 | 5 | 6;
  compact?: boolean;
  sheetIndex?: number;
  totalSheets?: number;
  fontScale?: number;
}

/** 根据题量、列数及压缩选项生成题目网格，由 A4Sheet 分配实际纸张空间。 */
export function PrintWorksheet({
  rule,
  problems,
  columns = 'auto',
  compact = true,
  sheetIndex,
  totalSheets,
  fontScale = 1.0,
}: PrintWorksheetProps) {
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const effectiveColumns =
    columns === 'auto'
      ? getAutoColumns(problems.length, rule.displayFormat)
      : Math.min(6, Math.max(2, columns)) as 2 | 3 | 4 | 5 | 6;

  const density = compact
    ? calculatePrintDensity(problems.length, effectiveColumns)
    : 'normal';

  const gridColsClass = {
    2: 'grid-cols-2 gap-x-6',
    3: 'grid-cols-3 gap-x-4',
    4: 'grid-cols-4 gap-x-2.5',
    5: 'grid-cols-5 gap-x-1.5',
    6: 'grid-cols-6 gap-x-1',
  }[effectiveColumns] || 'grid-cols-4 gap-x-2.5';

  const gapYClass = {
    'normal': 'gap-y-3.5',
    'compact': 'gap-y-2.5',
    'dense': 'gap-y-1.5',
    'ultra-dense': 'gap-y-1',
  }[density];

  const headerPaddingClass = {
    'normal': 'pb-2 mb-2.5',
    'compact': 'pb-1.5 mb-2',
    'dense': 'pb-1 mb-1',
    'ultra-dense': 'pb-0.5 mb-0.5',
  }[density];

  const headerTitleClass = {
    'normal': 'text-lg',
    'compact': 'text-base',
    'dense': 'text-sm',
    'ultra-dense': 'text-xs',
  }[density];

  const instructionClass = {
    'normal': 'text-xs mb-2',
    'compact': 'text-xs mb-1.5',
    'dense': 'text-[11px] mb-1',
    'ultra-dense': 'text-[10px] mb-0.5',
  }[density];

  const itemIndexClass = {
    'normal': 'text-[11px] font-bold text-slate-400 mb-0.5',
    'compact': 'text-[10px] font-bold text-slate-400 mb-0.5',
    'dense': 'text-[9.5px] font-bold text-slate-400 mb-0',
    'ultra-dense': 'text-[8.5px] font-bold text-slate-400 mb-0',
  }[density];

  return (
    <div className="a4-page-worksheet">
      {/* 1. 학습지 상단 헤더 (A4 1장 최적화를 위해 밀도에 따라 높이 자동 조절) */}
      <div className={`border-b-2 border-slate-900 ${headerPaddingClass}`}>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
          <span className="tracking-widest uppercase text-slate-600 font-black">
            MathLab Kids · 초등 수학 학습지
          </span>
          <span>{currentDate}</span>
        </div>

        <div className="flex items-baseline justify-between mt-0.5">
          <div className="flex items-baseline gap-2">
            <h1 className={`font-black text-slate-900 tracking-tight ${headerTitleClass}`}>
              {rule.title || '수학 연산 연습'}
            </h1>
          </div>
          <div className="text-xs font-bold text-slate-700 flex items-center gap-3">
            <span>
              이름: <span className="inline-block w-16 border-b border-slate-500"></span>
            </span>
            <span>
              점수: <span className="inline-block w-10 border-b border-slate-500 text-right pr-1"></span> / 100
            </span>
          </div>
        </div>
      </div>

      {/* 2. 지시문 및 예시 안내 */}
      <div className={`font-semibold text-slate-600 flex items-center justify-between ${instructionClass}`}>
        <span>다음 식을 정확하게 계산해 보세요.</span>
        {rule.showFirstExample && (
          <span className="text-[10.5px] font-bold text-emerald-700">
            * 1번 문제는 정답 예시입니다.
          </span>
        )}
      </div>

      {/* 3. 문제 그리드 (A4 1장 내 100% 압축 배분) */}
      <div className={`worksheet-grid grid ${gridColsClass} ${gapYClass}`}>
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="print-avoid-break p-0.5 rounded-lg flex flex-col justify-start border border-transparent"
          >
            <div className={`${itemIndexClass} select-none`}>
              [{problem.index}]
            </div>

            <div className="w-full flex justify-center items-center py-0.5 overflow-visible">
              <div
                className={`${problem.displayFormat === 'vertical' ? 'inline-flex' : 'w-full'} items-center justify-center transition-transform`}
                style={
                  fontScale && fontScale !== 1
                    ? {
                        transform: `scale(${fontScale})`,
                        transformOrigin:
                          problem.displayFormat === 'vertical'
                            ? 'top center'
                            : 'center center',
                      }
                    : undefined
                }
                data-font-scale={fontScale}
              >
                {problem.displayFormat === 'vertical' ? (
                  <VerticalProblem
                    problem={problem}
                    isReadOnly={true}
                    showExampleAnswer={problem.isExample && rule.showFirstExample}
                    compact={compact}
                    density={density}
                  />
                ) : (
                  <HorizontalProblem
                    problem={problem}
                    isReadOnly={true}
                    showExampleAnswer={problem.isExample && rule.showFirstExample}
                    compact={compact}
                    fullWidth={true}
                    density={density}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
