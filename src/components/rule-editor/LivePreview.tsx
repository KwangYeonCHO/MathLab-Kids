'use client';

import React, { useMemo } from 'react';
import { WorksheetRule } from '@/domain/math/types';
import { generateWorksheet } from '@/domain/math/generators/engine';
import { UniversalProblem } from '../problem-view/UniversalProblem';
import { Eye, AlertCircle, RefreshCw } from 'lucide-react';

interface LivePreviewProps {
  rule: WorksheetRule;
  onRefresh?: () => void;
}

export function LivePreview({ rule, onRefresh }: LivePreviewProps) {
  // 실시간 3문제 생성
  const previewResult = useMemo(() => {
    const previewRule: WorksheetRule = {
      ...rule,
      count: Math.min(3, rule.count),
    };
    return generateWorksheet(previewRule);
  }, [rule]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-20">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-base">실시간 문제 미리보기</h3>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="미리보기 새로고침"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-4">
        {!previewResult.success ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold mb-0.5">문제를 생성할 수 없습니다</p>
              <p>{previewResult.errorMessage}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {previewResult.problems.map((problem, idx) => (
              <div
                key={problem.id || idx}
                className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-slate-500">
                    문제 {idx + 1}
                  </span>
                  {problem.isExample && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      정답 예시
                    </span>
                  )}
                </div>

                <div className="flex justify-center py-2">
                  <UniversalProblem
                    problem={problem}
                    isReadOnly={true}
                    showExampleAnswer={problem.isExample}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-400">
        설정한 규칙에 따라 실제 시험지에는 총 {rule.count}문제가 생성됩니다.
      </div>
    </div>
  );
}
