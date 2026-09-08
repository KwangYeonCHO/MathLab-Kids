'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useWorksheetStore } from '@/stores/worksheetStore';
import { getAllSessions } from '@/db/historyDb';
import { Trophy, Clock, CheckCircle, XCircle, RotateCcw, PlusCircle, Printer, ArrowRight, BarChart2 } from 'lucide-react';
import { formatFraction } from '@/domain/math/core/fraction';

export default function ResultPage() {
  const router = useRouter();
  const { lastResult, retryMistakes, retryWithSameRule } = useWorksheetStore();

  useEffect(() => {
    if (!lastResult) {
      getAllSessions().then((sessions) => {
        if (sessions && sessions.length > 0) {
          useWorksheetStore.setState({ lastResult: sessions[0] });
        }
      });
    }
  }, [lastResult]);

  useEffect(() => {
    // 80점 이상이면 폭죽 효과
    if (lastResult && lastResult.accuracyRate >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [lastResult]);

  if (!lastResult) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-slate-600 font-bold text-lg">최근 학습 결과가 없습니다.</p>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow"
        >
          새 문제 만들기
        </Link>
      </div>
    );
  }

  const {
    title,
    totalCount,
    correctCount,
    incorrectCount,
    accuracyRate,
    totalTimeSpentMs,
    averageTimeSpentMs,
    problems,
    userAnswers,
  } = lastResult;

  const formatMs = (ms: number) => {
    const totalSec = Math.round(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    if (m > 0) return `${m}분 ${s}초`;
    return `${s}초`;
  };

  const handleRetryMistakesNew = () => {
    retryMistakes('new_like');
    router.push('/practice');
  };

  const handleRetryMistakesOriginal = () => {
    retryMistakes('original');
    router.push('/practice');
  };

  const handleRetrySame = () => {
    retryWithSameRule();
    router.push('/practice');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* 결과 헤더 카드 */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm text-center relative overflow-hidden">
        <div className="inline-flex p-4 rounded-2xl bg-amber-50 text-amber-500 mb-4 shadow-xs">
          <Trophy className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          학습 결과
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{title}</p>

        {/* 점수 & 정답률 */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-6 sm:gap-12">
          <div className="text-center">
            <span className="text-xs font-bold text-slate-400 block mb-1">점수</span>
            <span className="text-4xl sm:text-6xl font-black text-emerald-600">
              {accuracyRate}
              <span className="text-xl sm:text-2xl text-slate-400 font-bold ml-1">점</span>
            </span>
          </div>

          <div className="h-14 w-px bg-slate-200 hidden sm:block" />

          <div className="text-center">
            <span className="text-xs font-bold text-slate-400 block mb-1">맞힌 문제</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-800">
              <span className="text-emerald-600">{correctCount}</span>
              <span className="text-slate-400 text-lg sm:text-xl font-medium"> / {totalCount}</span>
            </span>
          </div>

          <div className="h-14 w-px bg-slate-200 hidden sm:block" />

          <div className="text-center">
            <span className="text-xs font-bold text-slate-400 block mb-1">총 풀이 시간</span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">
              {formatMs(totalTimeSpentMs)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
              (문제당 평균 {formatMs(averageTimeSpentMs)})
            </span>
          </div>
        </div>

        {/* 핵심 액션 버튼 (매뉴얼 19장) */}
        <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap justify-center gap-3">
          {incorrectCount > 0 && (
            <>
              <button
                onClick={handleRetryMistakesNew}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-98"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                오답 다시 풀기 (새로운 문제)
              </button>

              <button
                onClick={handleRetryMistakesOriginal}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
              >
                틀린 문제 그대로 다시 풀기
              </button>
            </>
          )}

          <button
            onClick={handleRetrySame}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            같은 난이도로 새 문제 풀기
          </button>

          <Link
            href="/print"
            className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            학습지 인쇄
          </Link>
        </div>
      </div>

      {/* 문제별 상세 정오표 */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-base">문제별 풀이 결과 상세</h2>
          </div>
          <span className="text-xs text-slate-400">
            총 {totalCount}문제 중 {correctCount}문제 정답
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {problems.map((problem) => {
            const userAns = userAnswers[problem.id];
            const isCorrect = userAns?.isCorrect;

            const opSymbol = {
              addition: '+',
              subtraction: '−',
              multiplication: '×',
              division: '÷',
            }[problem.operation];

            return (
              <div
                key={problem.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-rose-200 bg-rose-50/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                  <div className="text-sm math-font font-bold text-slate-800">
                    <span className="text-xs text-slate-400 mr-2 font-mono">[{problem.index}]</span>
                    {problem.category === 'fraction' ? (
                      <span>
                        {problem.fractionA ? formatFraction(problem.fractionA) : ''} {opSymbol}{' '}
                        {problem.fractionB ? formatFraction(problem.fractionB) : ''} ={' '}
                        <span className="text-slate-900 font-extrabold">
                          {problem.fractionAnswer ? formatFraction(problem.fractionAnswer) : ''}
                        </span>
                      </span>
                    ) : problem.category === 'mixed_operation' ? (
                      <span>
                        {problem.expression} ={' '}
                        <span className="text-slate-900 font-extrabold">{problem.answer}</span>
                      </span>
                    ) : problem.category === 'proportion' && problem.proportion ? (
                      <span>
                        {problem.proportion.a ?? '□'} : {problem.proportion.b ?? '□'} ={' '}
                        {problem.proportion.c ?? '□'} : {problem.proportion.d ?? '□'} (정답:{' '}
                        <span className="text-slate-900 font-extrabold">{problem.answer}</span>)
                      </span>
                    ) : problem.category === 'factors_multiples' ? (
                      <span>
                        {problem.operandA}, {problem.operandB}의{' '}
                        {problem.factorProblemType === 'lcm' ? '최소공배수' : '최대공약수'} ={' '}
                        <span className="text-slate-900 font-extrabold">{problem.answer}</span>
                      </span>
                    ) : (
                      <span>
                        {problem.operandA} {opSymbol} {problem.operandB} ={' '}
                        <span className="text-slate-900 font-extrabold">{problem.answer}</span>
                        {problem.operation === 'division' && problem.remainder !== undefined && (
                          <span className="text-xs text-slate-500 font-medium ml-1">
                            … {problem.remainder}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* 학생 답안 */}
                <div className="text-right">
                  <div className="text-xs text-slate-500">
                    내 답:{' '}
                    <span
                      className={`font-bold math-font ${
                        isCorrect ? 'text-emerald-700' : 'text-rose-700 font-extrabold'
                      }`}
                    >
                      {problem.category === 'fraction'
                        ? userAns?.fractionAnswer
                          ? formatFraction(userAns.fractionAnswer)
                          : '미입력'
                        : userAns?.answer !== null && userAns?.answer !== undefined
                        ? userAns.answer
                        : '미입력'}
                      {problem.operation === 'division' && problem.remainder !== undefined && (
                        <span className="ml-1 text-[11px]">
                          … {userAns?.remainder ?? 0}
                        </span>
                      )}
                    </span>
                  </div>
                  {userAns?.timeSpentMs && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {Math.round(userAns.timeSpentMs / 1000)}초 소요
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
