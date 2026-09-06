'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RuleEditor } from '@/components/rule-editor/RuleEditor';
import { LivePreview } from '@/components/rule-editor/LivePreview';
import { useWorksheetStore } from '@/stores/worksheetStore';
import { Play, Printer, RefreshCw, AlertCircle } from 'lucide-react';

export default function CreatePage() {
  const router = useRouter();
  const { currentRule, generateNewProblems, generationError, startPractice } = useWorksheetStore();
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const handleStartPractice = () => {
    const success = generateNewProblems();
    if (success) {
      startPractice();
      router.push('/practice');
    }
  };

  const handleGoToPrint = () => {
    const success = generateNewProblems();
    if (success) {
      router.push('/print');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 상단 타이틀 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            문제 만들기
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            원하는 연산 조건과 자릿수, 받아올림을 설정하고 즉시 풀거나 인쇄하세요.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleGoToPrint}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            인쇄하기
          </button>
          <button
            type="button"
            onClick={handleStartPractice}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <Play className="w-4 h-4 fill-current" />
            온라인으로 풀기
          </button>
        </div>
      </div>

      {/* 에러 메시지 배너 */}
      {generationError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <p className="font-bold">조건 생성 오류</p>
            <p>{generationError}</p>
          </div>
        </div>
      )}

      {/* 모바일용 탭 스위처 */}
      <div className="flex lg:hidden bg-slate-200 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          규칙 설정
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          실시간 미리보기
        </button>
      </div>

      {/* 2열 레이아웃: 좌측 설정 패널 + 우측 실시간 미리보기 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={`lg:col-span-7 xl:col-span-8 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          <RuleEditor />
        </div>

        <div className={`lg:col-span-5 xl:col-span-4 ${activeTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <LivePreview rule={currentRule} onRefresh={() => generateNewProblems()} />
        </div>
      </div>
    </div>
  );
}
