'use client';

import React, { useState } from 'react';
import { GRADE_PRESETS } from '@/domain/math/presets';
import { matchesPreset } from '@/domain/math/ruleTitle';
import { useWorksheetStore } from '@/stores/worksheetStore';
import { Sparkles } from 'lucide-react';
import { CreateActionButtons } from './CreateActionButtons';

export function PresetSelector() {
  const { currentRule, currentPresetId, loadPreset } = useWorksheetStore();
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<'all' | 1 | 2>('all');

  const gradeTabs = [
    { id: 'all', label: `전체 (${GRADE_PRESETS.length})` },
    { id: '초1', label: '1학년' },
    { id: '초2', label: '2학년' },
    { id: '초3', label: '3학년' },
    { id: '초4', label: '4학년' },
    { id: '초5', label: '5학년' },
    { id: '초6', label: '6학년' },
  ];

  const semesterTabs = [
    { id: 'all', label: '전체 학기' },
    { id: 1, label: selectedGrade === 'all' ? '1학기 전체' : `${selectedGrade}(1학기)` },
    { id: 2, label: selectedGrade === 'all' ? '2학기 전체' : `${selectedGrade}(2학기)` },
  ];

  const filteredPresets = GRADE_PRESETS.filter((p) => {
    if (selectedGrade !== 'all' && p.gradeShort !== selectedGrade) return false;
    if (selectedSemester !== 'all' && p.semester !== selectedSemester) return false;
    return true;
  });

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-base">학년별 빠른 설정</h3>
            <span className="text-xs text-slate-500 font-normal">2022 개정 교과과정 학기별 공식 추천 규칙</span>
          </div>

          {/* 학년 필터 탭 */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {gradeTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedGrade(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedGrade === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 학기 서브 필터 탭 */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-1">학기 선택:</span>
          {semesterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedSemester(tab.id as 'all' | 1 | 2)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedSemester === tab.id
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-auto font-medium hidden sm:inline">
            총 {filteredPresets.length}개 프리셋
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {filteredPresets.map((preset) => {
          const isSelected = currentPresetId
            ? currentPresetId === preset.id
            : matchesPreset(currentRule, preset.rule);
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
                <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-white border border-slate-200 text-emerald-700 shadow-2xs">
                  {preset.semesterLabel}
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

      {/* 하단 액션 버튼 (인쇄하기 / 온라인으로 풀기) */}
      <div className="flex items-center justify-end pt-3 border-t border-slate-100">
        <CreateActionButtons />
      </div>
    </div>
  );
}
