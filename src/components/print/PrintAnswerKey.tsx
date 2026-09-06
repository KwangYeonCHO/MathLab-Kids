'use client';

import React from 'react';
import { Problem, WorksheetRule } from '@/domain/math/types';

interface PrintAnswerKeyProps {
  rule: WorksheetRule;
  problems: Problem[];
  columns?: number;
}

export function PrintAnswerKey({ rule, problems }: PrintAnswerKeyProps) {
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="print-page-break w-full max-w-4xl mx-auto bg-white p-2 sm:p-4 print:p-0 pt-4">
      {/* 정답지 헤더 (극도로 컴팩트한 바 형태) */}
      <div className="border-b-2 border-slate-900 pb-1.5 mb-2 flex items-center justify-between text-xs">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-black tracking-widest text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            빠른 정답표
          </span>
          <h2 className="text-sm font-black text-slate-900">
            {rule.title || '수학 연산 연습'} 정답 (10문항/행)
          </h2>
        </div>
        <div className="text-[11px] text-slate-400">{currentDate}</div>
      </div>

      {/* 정답 그리드: 한 행에 정확히 10개씩 배치 (50문제도 단 5줄로 완벽 압축) */}
      <div className="grid grid-cols-5 sm:grid-cols-10 print:grid-cols-10 gap-1 print:gap-1">
        {problems.map((problem) => {
          const hasRemainder =
            problem.operation === 'division' && problem.remainder !== undefined;

          return (
            <div
              key={problem.id}
              className="py-1 px-1.5 bg-slate-50 print:bg-white rounded border border-slate-300 print:border-slate-400 text-xs flex items-center justify-between math-font select-none"
            >
              <span className="font-bold text-[10px] text-slate-500 print:text-slate-600">
                [{problem.index}]
              </span>
              <span className="font-black text-slate-900 tabular-nums ml-0.5 text-xs">
                {problem.answer}
                {hasRemainder && (
                  <span className="text-[10px] text-slate-600 font-semibold">
                    …{problem.remainder}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
