'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, Play, History, Sparkles, BookOpen, ArrowRight, Printer } from 'lucide-react';
import { useWorksheetStore } from '@/stores/worksheetStore';
import { GRADE_PRESETS } from '@/domain/math/presets';
import { getInProgressSession } from '@/db/historyDb';

export default function HomePage() {
  const router = useRouter();
  const { loadPreset, restoreSession, generateNewProblems, startPractice } = useWorksheetStore();
  const [hasInProgress, setHasInProgress] = useState(false);
  const [inProgressData, setInProgressData] = useState<any>(null);

  useEffect(() => {
    // 진행 중인 학습 기록이 있는지 확인
    getInProgressSession().then((saved) => {
      if (saved && saved.problems && saved.problems.length > 0) {
        setHasInProgress(true);
        setInProgressData(saved);
      }
    });
  }, []);

  const handleResume = () => {
    if (inProgressData) {
      restoreSession(
        inProgressData.rule,
        inProgressData.problems,
        inProgressData.userAnswers,
        inProgressData.currentIndex
      );
      router.push('/practice');
    }
  };

  const handleQuickStart = (presetId: string) => {
    loadPreset(presetId);
    startPractice();
    router.push('/practice');
  };

  return (
    <div className="space-y-10 pb-10">
      {/* 히어로 섹션 */}
      <section className="text-center pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold mb-4">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>대한민국 2022 개정 초등 수학 교육과정 맞춤</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          초등 수학 연산 실력을 다지는 <br className="hidden sm:inline" />
          가장 스마트한 <span className="text-emerald-600">수학 실험실</span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          자릿수, 받아올림·받아내림 횟수, 몫과 나머지를 세밀하게 설정하고
          온라인 실시간 풀이와 A4 인쇄 학습지를 한 번에 제공합니다.
        </p>
      </section>

      {/* 핵심 3대 행동 카드 (매뉴얼 6.1) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 카드 1: 문제 만들기 */}
        <Link
          href="/create"
          className="group p-6 bg-white rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">새 문제 만들기</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              덧셈·뺄셈·곱셈·나눗셈의 자릿수와 받아올림 조건을 직접 지정하여 문제 세트를 생성합니다.
            </p>
          </div>
          <div className="mt-6 flex items-center text-sm font-bold text-emerald-600 gap-1 group-hover:translate-x-1 transition-transform">
            <span>설정하러 가기</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* 카드 2: 이어서 풀기 */}
        <div
          className={`p-6 bg-white rounded-2xl border transition-all flex flex-col justify-between ${
            hasInProgress
              ? 'border-indigo-500/40 hover:border-indigo-500 hover:shadow-lg cursor-pointer'
              : 'border-slate-200 opacity-60'
          }`}
          onClick={hasInProgress ? handleResume : undefined}
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Play className="w-7 h-7" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-slate-900">이어서 풀기</h2>
              {hasInProgress && (
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  진행 중
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              {hasInProgress
                ? `풀다 멈춘 ${inProgressData?.problems?.length ?? 20}문제 세트가 저장되어 있습니다. 바로 이어서 풀 수 있습니다.`
                : '이전에 풀던 진행 중 학습이 없습니다. 새로운 문제를 만들어 시작해 보세요.'}
            </p>
          </div>
          <div className="mt-6 flex items-center text-sm font-bold text-indigo-600 gap-1">
            <span>{hasInProgress ? '지금 이어서 풀기' : '저장된 문제 없음'}</span>
            {hasInProgress && <ArrowRight className="w-4 h-4" />}
          </div>
        </div>

        {/* 카드 3: 학습 기록 */}
        <Link
          href="/history"
          className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <History className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">나의 학습 기록</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              로그인 없이도 브라우저에 자동 보관된 풀이 결과, 정답률 추이, 오답 유형을 확인합니다.
            </p>
          </div>
          <div className="mt-6 flex items-center text-sm font-bold text-amber-700 gap-1 group-hover:translate-x-1 transition-transform">
            <span>기록 보러 가기</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </section>

      {/* 학년별 공식 추천 바로가기 */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">학년별 추천 연산 바로 시작</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              원클릭으로 문제를 자동 생성하여 온라인으로 즉시 풀거나 인쇄할 수 있습니다.
            </p>
          </div>
          <Link
            href="/create"
            className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>전체 규칙 보기</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {GRADE_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-white text-emerald-700 border border-slate-200 mb-2">
                  {preset.gradeShort}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">{preset.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {preset.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <button
                  onClick={() => handleQuickStart(preset.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  풀기
                </button>
                <Link
                  href="/print"
                  onClick={() => loadPreset(preset.id)}
                  className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  인쇄
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
