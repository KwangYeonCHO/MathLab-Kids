'use client';

import React from 'react';
import { Problem, WorksheetRule } from '@/domain/math/types';
import { Scissors } from 'lucide-react';

import { formatFraction } from '@/domain/math/core/fraction';

interface PrintAnswerKeyProps {
  rule: WorksheetRule;
  problems: Problem[];
  columns?: number;
  sheetIndex?: number;
  totalSheets?: number;
  showCutLine?: boolean;
}

/** 将规则标题和题目答案渲染为紧凑答案区，保证纵向严整对齐。 */
export function PrintAnswerKey({
  rule,
  problems,
  columns,
  sheetIndex,
  totalSheets,
  showCutLine = true,
}: PrintAnswerKeyProps) {
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const effectiveColumns =
    columns ?? (rule.category === 'fraction' ? 10 : 15);

  return (
    <div className="a4-answer-key">
      {/* 절취선 (가위로 잘라 보관할 수 있는 컷팅 가이드 라인) */}
      {showCutLine && (
        <div className="relative flex items-center justify-center pt-1 pb-2 mb-2 select-none text-slate-400">
          <div className="w-full border-t border-dashed border-slate-300"></div>
          <div className="absolute bg-white px-2.5 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 tracking-wider">
            <Scissors className="w-3 h-3 text-slate-400 -rotate-90" />
            <span>절취선 (가위로 잘라 보관하세요)</span>
          </div>
        </div>
      )}

      {/* 정답지 헤더 (극도로 컴팩트한 바 형태) */}
      <div className="pb-1 flex items-center justify-between text-xs">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-black tracking-widest text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            빠른 정답표
          </span>
          <h2 className="text-sm font-black text-slate-900">
            {rule.title || '수학 연산 연습'} 정답
          </h2>
        </div>
        <div className="text-[11px] text-slate-400">{currentDate}</div>
      </div>

      {/* 프린터 컬러 노즐 막힘 방지 3mm 레인보우 컬러 밴드 */}
      <div
        className="w-full mb-2 rounded-[0.5mm] overflow-hidden"
        style={{
          height: '3mm',
          minHeight: '3mm',
          maxHeight: '3mm',
          background: 'linear-gradient(to right, #ff0000 0%, #ff6b00 10%, #ffd000 20%, #00e676 35%, #00e5ff 50%, #2979ff 65%, #651fff 80%, #f50057 90%, #ff0000 100%)',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
        title="프린터 헤드 노즐 막힘 방지 3mm 레인보우 컬러 밴드"
      />

      {/* 答案网格：每行固定答案，列与列纵向严格对齐 */}
      <div
        className={`grid grid-cols-${effectiveColumns} gap-x-1 gap-y-1 w-full`}
        style={{
          gridTemplateColumns: `repeat(${effectiveColumns}, minmax(0, 1fr))`,
        }}
      >
        {problems.map((problem) => {
          const hasRemainder =
            problem.operation === 'division' && problem.remainder !== undefined;

          return (
            <div
              key={problem.id}
              className="py-0.5 px-0.5 text-xs flex items-baseline whitespace-nowrap math-font select-none overflow-hidden"
            >
              <span className="font-bold text-[9.5px] text-slate-400 shrink-0 inline-block min-w-[20px] tabular-nums">
                [{problem.index}]
              </span>
              <span className="font-black text-slate-900 tabular-nums ml-0.5 text-[11px] leading-none">
                {problem.category === 'fraction' && problem.fractionAnswer ? (
                  formatFraction(problem.fractionAnswer)
                ) : (
                  <>
                    {problem.answer}
                    {hasRemainder && (
                      <span className="text-[9.5px] text-slate-600 font-semibold ml-0.5">
                        …{problem.remainder}
                      </span>
                    )}
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
