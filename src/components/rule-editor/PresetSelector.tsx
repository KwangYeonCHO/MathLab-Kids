'use client';

import React from 'react';
import { GRADE_PRESETS } from '@/domain/math/presets';
import { matchesPreset } from '@/domain/math/ruleTitle';
import { useWorksheetStore } from '@/stores/worksheetStore';
import { Sparkles } from 'lucide-react';

export function PresetSelector() {
  const { currentRule, loadPreset } = useWorksheetStore();

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-slate-800 text-base">학년별 빠른 설정</h3>
        <span className="text-xs text-slate-500 font-normal">자주 쓰는 공식 추천 규칙</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {GRADE_PRESETS.map((preset) => {
          const isSelected = matchesPreset(currentRule, preset.rule);
          return (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset.id)}
              className={`p-3 text-left rounded-xl border transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-white border border-slate-200 text-emerald-700">
                  {preset.gradeShort}
                </span>
                {isSelected && (
                  <span className="text-xs font-bold text-emerald-600">선택됨</span>
                )}
              </div>
              <div className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-1">
                {preset.title}
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
