'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWorksheetStore } from '@/stores/worksheetStore';
import { VerticalProblem } from '@/components/problem-view/VerticalProblem';
import { HorizontalProblem } from '@/components/problem-view/HorizontalProblem';
import { ChildKeypad } from '@/components/keypad/ChildKeypad';
import { playCorrectSound, playIncorrectSound } from '@/utils/sound';
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, LayoutGrid, Square, Check, Clock, RotateCcw } from 'lucide-react';

export default function PracticePage() {
  const router = useRouter();
  const {
    problems,
    currentIndex,
    userAnswers,
    practiceViewMode,
    isImmediateGrading,
    soundEnabled,
    currentRule,
    generateNewProblems,
    startPractice,
    setUserAnswer,
    submitCurrentAnswer,
    nextProblem,
    prevProblem,
    setCurrentIndex,
    setPracticeViewMode,
    setIsImmediateGrading,
    finishPractice,
  } = useWorksheetStore();

  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [activeInputType, setActiveInputType] = useState<'answer' | 'remainder'>('answer');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 문제 세트가 없으면 기본 문제 자동 생성
  useEffect(() => {
    if (problems.length === 0) {
      const ok = generateNewProblems();
      if (ok) {
        startPractice();
      } else {
        router.push('/create');
      }
    }
  }, [problems.length, generateNewProblems, startPractice, router]);

  // 경과 시간 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentProblem = problems[currentIndex];
  const currentAnswer = currentProblem ? userAnswers[currentProblem.id] : undefined;
  const isDivisionWithRemainder =
    currentProblem?.operation === 'division' && currentProblem?.remainder !== undefined;

  // 문제 번호가 변경되면 항상 기본 답안(몫) 입력 모드로 자동 복귀
  useEffect(() => {
    setActiveInputType('answer');
  }, [currentIndex]);

  // 가상 키패드 입력 핸들러 (stale closure 방지를 위해 최신 store 상태 직접 조회)
  const handleKeypadDigit = (digit: string) => {
    if (!currentProblem) return;
    const curAns = useWorksheetStore.getState().userAnswers[currentProblem.id];

    if (activeInputType === 'remainder' && isDivisionWithRemainder) {
      const prevRem =
        curAns?.remainder !== null && curAns?.remainder !== undefined
          ? curAns.remainder.toString()
          : '';
      const nextRem = parseInt(prevRem + digit, 10);
      setUserAnswer(currentProblem.id, undefined, isNaN(nextRem) ? null : nextRem);
    } else {
      const prevAns =
        curAns?.answer !== null && curAns?.answer !== undefined
          ? curAns.answer.toString()
          : '';
      const nextAns = parseInt(prevAns + digit, 10);
      setUserAnswer(currentProblem.id, isNaN(nextAns) ? null : nextAns, undefined);
    }
  };

  const handleKeypadBackspace = () => {
    if (!currentProblem) return;
    const curAns = useWorksheetStore.getState().userAnswers[currentProblem.id];

    if (activeInputType === 'remainder' && isDivisionWithRemainder) {
      const prevRem =
        curAns?.remainder !== null && curAns?.remainder !== undefined
          ? curAns.remainder.toString()
          : '';
      if (prevRem.length <= 1) {
        setUserAnswer(currentProblem.id, undefined, null);
      } else {
        const nextRem = parseInt(prevRem.slice(0, -1), 10);
        setUserAnswer(currentProblem.id, undefined, isNaN(nextRem) ? null : nextRem);
      }
    } else {
      const prevAns =
        curAns?.answer !== null && curAns?.answer !== undefined
          ? curAns.answer.toString()
          : '';
      if (prevAns.length <= 1) {
        setUserAnswer(currentProblem.id, null, undefined);
      } else {
        const nextAns = parseInt(prevAns.slice(0, -1), 10);
        setUserAnswer(currentProblem.id, isNaN(nextAns) ? null : nextAns, undefined);
      }
    }
  };

  const handleKeypadClear = () => {
    if (!currentProblem) return;
    if (activeInputType === 'remainder' && isDivisionWithRemainder) {
      setUserAnswer(currentProblem.id, undefined, null);
    } else {
      setUserAnswer(currentProblem.id, null, undefined);
    }
  };

  const handleSubmit = async () => {
    if (!currentProblem) return;
    const curAns = useWorksheetStore.getState().userAnswers[currentProblem.id];

    // 현재 문제 입력값 확인
    if (curAns?.answer === null || curAns?.answer === undefined) {
      alert('답을 입력해 주세요.');
      return;
    }

    if (
      isDivisionWithRemainder &&
      (curAns.remainder === null || curAns.remainder === undefined)
    ) {
      alert('나머지를 입력해 주세요.');
      return;
    }

    if (isImmediateGrading) {
      const isCorrect = submitCurrentAnswer();
      if (isCorrect) {
        if (soundEnabled) playCorrectSound();
        setFeedback('correct');
      } else {
        if (soundEnabled) playIncorrectSound();
        setFeedback('incorrect');
      }

      setTimeout(() => {
        setFeedback(null);
        if (currentIndex < problems.length - 1) {
          nextProblem();
          setActiveInputType('answer');
        }
      }, 700);
    } else {
      if (currentIndex < problems.length - 1) {
        nextProblem();
        setActiveInputType('answer');
      }
    }
  };

  const handleNextProblem = () => {
    const curAns = useWorksheetStore.getState().userAnswers[currentProblem.id];
    const hasAnswer =
      curAns?.answer !== null &&
      curAns?.answer !== undefined &&
      !isNaN(Number(curAns?.answer));

    if (isImmediateGrading && hasAnswer && !curAns?.submittedAt) {
      handleSubmit();
    } else {
      if (currentIndex < problems.length - 1) {
        nextProblem();
        setActiveInputType('answer');
      }
    }
  };

  const handleFinishAll = async () => {
    const state = useWorksheetStore.getState();
    const unanswered = state.problems.filter((p) => {
      const a = state.userAnswers[p.id];
      return a?.answer === null || a?.answer === undefined;
    });

    if (unanswered.length > 0) {
      const confirmSubmit = window.confirm(
        `아직 답을 입력하지 않은 문제가 ${unanswered.length}개 있습니다. 그래도 채점하시겠습니까?`
      );
      if (!confirmSubmit) return;
    }

    await finishPractice();
    router.push('/result');
  };

  if (!currentProblem) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-bold">문제를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.values(userAnswers).filter(
    (a) => a.answer !== null && a.answer !== undefined
  ).length;
  const isLastProblem = currentIndex === problems.length - 1;

  // 실시간 즉시 채점 현황 집계
  let liveCorrectCount = 0;
  let liveIncorrectCount = 0;
  problems.forEach((p) => {
    const a = userAnswers[p.id];
    if (a && a.answer !== null && a.answer !== undefined && !isNaN(Number(a.answer))) {
      let ok = Number(a.answer) === p.answer;
      if (p.operation === 'division' && p.remainder !== undefined) {
        ok = ok && Number(a.remainder || 0) === p.remainder;
      }
      if (ok) liveCorrectCount++;
      else liveIncorrectCount++;
    }
  });
  const totalCount = problems.length;
  const currentEarnedScore =
    totalCount > 0 ? Math.round((liveCorrectCount / totalCount) * 100) : 0;
  const liveEvaluated = liveCorrectCount + liveIncorrectCount;
  const accuracyRate =
    liveEvaluated > 0 ? Math.round((liveCorrectCount / liveEvaluated) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* 상단 컨트롤 바 */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
            <span>
              푼 문제: <span className="text-emerald-600 font-black">{answeredCount}</span> / {problems.length}
            </span>

            {/* 즉시 채점 켜짐 상태일 때 실시간 채점 현황 표시 (총 100점 만점 기준 맞힌 문제에 따라 실시간 득점) */}
            {isImmediateGrading && (
              <span className="inline-flex items-center gap-2 pl-2 border-l border-slate-200 animate-in fade-in duration-150">
                <span className="inline-flex items-center gap-0.5 text-emerald-600 font-extrabold" title="정답 수">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {liveCorrectCount}
                </span>
                <span className="inline-flex items-center gap-0.5 text-rose-500 font-extrabold" title="오답 수">
                  <XCircle className="w-3.5 h-3.5" /> {liveIncorrectCount}
                </span>
                <span
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-black text-[11px] rounded border border-emerald-200"
                  title="총 문항 수(100점 만점) 기준 현재 획득 점수"
                >
                  현재 {currentEarnedScore}점
                </span>
                {liveIncorrectCount > 0 && (
                  <span className="text-[10.5px] text-slate-400 font-semibold" title="푼 문제 중 정답률">
                    ({accuracyRate}%)
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* 뷰 모드 토글 (한 문제씩 / 한꺼번에) */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setPracticeViewMode('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                practiceViewMode === 'single'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              한 문제씩
            </button>
            <button
              onClick={() => setPracticeViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                practiceViewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              한꺼번에
            </button>
          </div>

          {/* 즉시 채점 토글 */}
          <button
            onClick={() => setIsImmediateGrading(!isImmediateGrading)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              isImmediateGrading
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            {isImmediateGrading ? '즉시 채점 ON' : '즉시 채점 OFF'}
          </button>
        </div>
      </div>

      {/* 1. 한 문제씩 풀기 모드 (Single Mode) */}
      {practiceViewMode === 'single' ? (
        <div className="space-y-6">
          {/* 진행 바 */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }}
            />
          </div>

          {/* 메인 문제 카드 */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm text-center relative overflow-hidden">
            {/* 정답/오답 즉시 피드백 오버레이 */}
            {feedback === 'correct' && (
              <div className="absolute inset-0 bg-emerald-500/15 backdrop-blur-xs flex items-center justify-center z-10 animate-in zoom-in-95 duration-150">
                <div className="bg-white px-6 py-3 rounded-2xl shadow-xl border-2 border-emerald-500 flex items-center gap-2.5 text-emerald-700 font-black text-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  정답입니다! 🎉
                </div>
              </div>
            )}
            {feedback === 'incorrect' && (
              <div className="absolute inset-0 bg-rose-500/15 backdrop-blur-xs flex items-center justify-center z-10 animate-in zoom-in-95 duration-150">
                <div className="bg-white px-6 py-3 rounded-2xl shadow-xl border-2 border-rose-500 flex items-center gap-2.5 text-rose-700 font-black text-xl">
                  <XCircle className="w-8 h-8 text-rose-600" />
                  다시 계산해 보세요!
                </div>
              </div>
            )}

            {/* 문제 번호 & 지시문 */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-black">
                문제 {currentIndex + 1} / {problems.length}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {currentProblem.operation === 'division' && currentProblem.remainder !== undefined
                  ? '몫과 나머지를 구해 보세요.'
                  : '계산해 보세요.'}
              </span>
            </div>

            {/* 수식 렌더링 */}
            <div className="py-6 sm:py-8 flex justify-center items-center">
              {currentProblem.displayFormat === 'vertical' ? (
                <div className="scale-125 sm:scale-150 transform transition-transform my-4">
                  <VerticalProblem
                    key={currentProblem.id}
                    problem={currentProblem}
                    userAnswer={currentAnswer?.answer}
                    onFocus={() => setActiveInputType('answer')}
                    onSubmit={handleSubmit}
                    onAnswerChange={(val) =>
                      setUserAnswer(currentProblem.id, val, undefined)
                    }
                  />
                </div>
              ) : (
                <div className="scale-110 sm:scale-125 transform transition-transform my-4">
                  <HorizontalProblem
                    key={currentProblem.id}
                    problem={currentProblem}
                    userAnswer={currentAnswer?.answer}
                    userRemainder={currentAnswer?.remainder}
                    onFocusAnswer={() => setActiveInputType('answer')}
                    onFocusRemainder={() => setActiveInputType('remainder')}
                    onSubmit={handleSubmit}
                    onAnswerChange={(val) =>
                      setUserAnswer(currentProblem.id, val, undefined)
                    }
                    onRemainderChange={(val) =>
                      setUserAnswer(currentProblem.id, undefined, val)
                    }
                  />
                </div>
              )}
            </div>

            {/* 나눗셈의 경우 몫/나머지 입력 탭 선택 버튼 */}
            {currentProblem.operation === 'division' && currentProblem.remainder !== undefined && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setActiveInputType('answer')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeInputType === 'answer'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  몫 입력 중
                </button>
                <button
                  onClick={() => setActiveInputType('remainder')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeInputType === 'remainder'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  나머지 입력 중
                </button>
              </div>
            )}
          </div>

          {/* 문제 이동 버튼 및 가상 키패드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* 이전 / 다음 이동 내비게이터 */}
            <div className="flex flex-col gap-3 order-2 md:order-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevProblem}
                  disabled={currentIndex === 0}
                  className="py-3.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent text-sm font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  이전
                </button>

                {/* 즉시 정답 확인 버튼 */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  정답 확인 (Enter)
                </button>

                <button
                  type="button"
                  onClick={handleNextProblem}
                  disabled={currentIndex === problems.length - 1}
                  className="py-3.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent text-sm font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  다음
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* 완료 및 채점하기 버튼 */}
              <button
                type="button"
                onClick={handleFinishAll}
                className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-base font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <Check className="w-5 h-5 stroke-[3] text-emerald-400" />
                {isLastProblem ? '모두 풀었습니다 (최종 제출)' : '중간 채점 및 제출'}
              </button>
            </div>

            {/* 어린이 터치 친화형 숫자 키패드 */}
            <div className="order-1 md:order-2">
              <ChildKeypad
                onDigit={handleKeypadDigit}
                onBackspace={handleKeypadBackspace}
                onClear={handleKeypadClear}
                onSubmit={handleSubmit}
                allowNegative={currentRule.allowNegative}
              />
            </div>
          </div>
        </div>
      ) : (
        /* 2. 여러 문제 한꺼번에 풀기 모드 (Grid Mode) */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {problems.map((problem, idx) => {
              const ans = userAnswers[problem.id];
              const hasAnswer =
                ans?.answer !== null &&
                ans?.answer !== undefined &&
                !isNaN(Number(ans?.answer));

              let isProbCorrect: boolean | null = null;
              if (hasAnswer) {
                let ok = Number(ans.answer) === problem.answer;
                if (problem.operation === 'division' && problem.remainder !== undefined) {
                  ok = ok && Number(ans.remainder || 0) === problem.remainder;
                }
                isProbCorrect = ok;
              }

              const cardBorderClass =
                isImmediateGrading && hasAnswer
                  ? isProbCorrect
                    ? 'border-2 border-emerald-500 bg-emerald-50/35 shadow-sm'
                    : 'border-2 border-rose-400 bg-rose-50/30'
                  : 'border border-slate-200 bg-white';

              return (
                <div
                  key={problem.id}
                  className={`p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-all duration-200 ${cardBorderClass}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-400">
                      문제 {idx + 1}
                    </span>

                    {/* 즉시 채점 실시간 배지 */}
                    {isImmediateGrading && hasAnswer && (
                      isProbCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full animate-in zoom-in-90 duration-150 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> 정답!
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full animate-in zoom-in-90 duration-150 shadow-2xs">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" /> 다시 풀기
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex justify-center items-center py-3">
                    {problem.displayFormat === 'vertical' ? (
                      <VerticalProblem
                        key={problem.id}
                        problem={problem}
                        userAnswer={ans?.answer}
                        onSubmit={() => {
                          if (isImmediateGrading && soundEnabled && hasAnswer) {
                            if (isProbCorrect) playCorrectSound();
                            else playIncorrectSound();
                          }
                        }}
                        onAnswerChange={(val) => {
                          setUserAnswer(problem.id, val, undefined);
                          if (isImmediateGrading && soundEnabled && val !== null && !isNaN(val)) {
                            if (Number(val) === problem.answer) {
                              playCorrectSound();
                            }
                          }
                        }}
                      />
                    ) : (
                      <HorizontalProblem
                        key={problem.id}
                        problem={problem}
                        userAnswer={ans?.answer}
                        userRemainder={ans?.remainder}
                        onSubmit={() => {
                          if (isImmediateGrading && soundEnabled && hasAnswer) {
                            if (isProbCorrect) playCorrectSound();
                            else playIncorrectSound();
                          }
                        }}
                        onAnswerChange={(val) => {
                          setUserAnswer(problem.id, val, undefined);
                          if (isImmediateGrading && soundEnabled && val !== null && !isNaN(val)) {
                            if (Number(val) === problem.answer) {
                              playCorrectSound();
                            }
                          }
                        }}
                        onRemainderChange={(val) =>
                          setUserAnswer(problem.id, undefined, val)
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 하단 일괄 채점하기 버튼 */}
          <div className="text-center pt-4">
            <button
              onClick={handleFinishAll}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-black rounded-2xl shadow-lg transition-all active:scale-98 inline-flex items-center gap-2"
            >
              <Check className="w-6 h-6 stroke-[3]" />
              전체 문제 채점하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
