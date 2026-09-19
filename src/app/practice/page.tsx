'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWorksheetStore, evaluateProblemAnswer } from '@/stores/worksheetStore';
import { UniversalProblem } from '@/components/problem-view/UniversalProblem';
import { Problem, UserAnswer } from '@/domain/math/types';
import { FractionValue } from '@/domain/math/core/fraction';
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
  const [activeInputType, setActiveInputType] = useState<'answer' | 'remainder' | 'whole' | 'num' | 'den'>('answer');
  const [activeFractionPart, setActiveFractionPart] = useState<'whole' | 'num' | 'den'>('num');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // 그리드 모드에서 현재 포커스 대상인 문제의 인덱스
  const [focusedGridIndex, setFocusedGridIndex] = useState<number>(0);
  const gridCardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const gridFinishButtonRef = useRef<HTMLButtonElement>(null);
  const desktopFinishButtonRef = useRef<HTMLButtonElement>(null);
  const mobileFinishButtonRef = useRef<HTMLButtonElement>(null);
  const isSubmittingRef = useRef(false);

  // 첫 번째 미작성 또는 미정답 문제의 인덱스 검색 (기본 1번, 풀이 중이면 해당 문제로 이동)
  const getNextPendingProblemIndex = (startIndex: number = 0): number => {
    if (!problems || problems.length === 0) return 0;
    const isCorrect = (prob: (typeof problems)[0]) => {
      const ans = userAnswers[prob.id];
      if (!ans) return false;
      return evaluateProblemAnswer(prob, ans);
    };
    for (let i = startIndex; i < problems.length; i++) {
      if (!isCorrect(problems[i])) return i;
    }
    for (let i = 0; i < startIndex; i++) {
      if (!isCorrect(problems[i])) return i;
    }
    return Math.min(startIndex, problems.length - 1);
  };

  // 모든 문제가 올바르게 풀렸는지 검사
  const areAllProblemsCorrect = (answersMap: Record<string, UserAnswer>): boolean => {
    if (!problems || problems.length === 0) return false;
    return problems.every((prob) => {
      const userAns = answersMap[prob.id];
      if (!userAns) return false;
      return evaluateProblemAnswer(prob, userAns);
    });
  };

  // 모든 문제의 답이 입력(시도)되었는지 검사
  const areAllProblemsAnswered = (answersMap: Record<string, UserAnswer>): boolean => {
    if (!problems || problems.length === 0) return false;
    return problems.every((p) => {
      const a = answersMap[p.id];
      if (!a) return false;
      if (p.category === 'fraction') {
        return Boolean(a.fractionAnswer && a.fractionAnswer.numerator !== undefined && a.fractionAnswer.denominator);
      }
      return a.answer !== null && a.answer !== undefined && !isNaN(Number(a.answer));
    });
  };

  // 채점/제출 버튼으로 포커스 이동 및 화면 중앙 스크롤
  const focusFinishButton = () => {
    setTimeout(() => {
      if (practiceViewMode === 'grid') {
        if (gridFinishButtonRef.current) {
          gridFinishButtonRef.current.focus();
          gridFinishButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const targetBtn = isMobile
          ? (mobileFinishButtonRef.current || desktopFinishButtonRef.current)
          : (desktopFinishButtonRef.current || mobileFinishButtonRef.current);
        if (targetBtn) {
          targetBtn.focus();
          targetBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 60);
  };

  // 모든 문제를 맞혔을 때 자동 채점 및 결과 페이지 이동
  const autoFinishPractice = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    await finishPractice();
    router.push('/result');
  };

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

  // 초기 진입 또는 뷰 모드 전환 시: 이미 푼 문제가 있으면 첫 번째 미작성/미정답 문제로 자동 커서 이동
  useEffect(() => {
    if (problems.length > 0) {
      const initialTarget = getNextPendingProblemIndex(0);
      if (practiceViewMode === 'single') {
        if (currentIndex !== initialTarget) {
          setCurrentIndex(initialTarget);
        }
      } else {
        setFocusedGridIndex(initialTarget);
      }
    }
  }, [problems.length, practiceViewMode]);

  const currentProblem = problems[currentIndex];
  const currentAnswer = currentProblem ? userAnswers[currentProblem.id] : undefined;
  const isDivisionWithRemainder =
    currentProblem?.operation === 'division' && currentProblem?.remainder !== undefined;

  // 문제 번호가 변경되면 문제 종류에 따라 입력 모드 자동 설정
  useEffect(() => {
    if (currentProblem?.category === 'fraction') {
      setActiveInputType('num');
      setActiveFractionPart('num');
    } else {
      setActiveInputType('answer');
    }
  }, [currentIndex, currentProblem?.category]);

  // 가상 키패드 입력 핸들러
  const handleKeypadDigit = (digit: string) => {
    if (!currentProblem) return;
    const curAns = useWorksheetStore.getState().userAnswers[currentProblem.id];

    if (currentProblem.category === 'fraction') {
      const curFrac: FractionValue = curAns?.fractionAnswer || { numerator: 0, denominator: 1 };
      if (activeInputType === 'whole') {
        const prevStr = curFrac.whole !== undefined && curFrac.whole !== null ? curFrac.whole.toString() : '';
        const nextVal = parseInt(prevStr + digit, 10);
        setUserAnswer(currentProblem.id, undefined, undefined, {
          ...curFrac,
          whole: isNaN(nextVal) ? undefined : nextVal,
        });
      } else if (activeInputType === 'num') {
        const prevStr = curFrac.numerator !== undefined && curFrac.numerator !== null && curFrac.numerator !== 0 ? curFrac.numerator.toString() : '';
        const nextVal = parseInt(prevStr + digit, 10);
        setUserAnswer(currentProblem.id, undefined, undefined, {
          ...curFrac,
          numerator: isNaN(nextVal) ? 0 : nextVal,
        });
      } else if (activeInputType === 'den') {
        const prevStr = curFrac.denominator !== undefined && curFrac.denominator !== null && curFrac.denominator !== 1 ? curFrac.denominator.toString() : '';
        const nextVal = parseInt(prevStr + digit, 10);
        setUserAnswer(currentProblem.id, undefined, undefined, {
          ...curFrac,
          denominator: isNaN(nextVal) || nextVal === 0 ? 1 : nextVal,
        });
      }
      return;
    }

    if (activeInputType === 'remainder' && isDivisionWithRemainder) {
      const prevRem =
        curAns?.rawRemainder ??
        (curAns?.remainder !== null && curAns?.remainder !== undefined
          ? curAns.remainder.toString()
          : '');
      if (digit === '.') {
        if (currentProblem.category === 'decimal' && !prevRem.includes('.')) {
          const nextRemRaw = prevRem === '' ? '0.' : prevRem + '.';
          setUserAnswer(currentProblem.id, undefined, parseFloat(nextRemRaw) || 0, undefined, undefined, nextRemRaw);
        }
      } else {
        const nextRemRaw = prevRem + digit;
        if (currentProblem.category === 'decimal') {
          const nextRem = parseFloat(nextRemRaw);
          setUserAnswer(currentProblem.id, undefined, isNaN(nextRem) ? null : nextRem, undefined, undefined, nextRemRaw);
        } else {
          const nextRem = parseInt(nextRemRaw, 10);
          setUserAnswer(currentProblem.id, undefined, isNaN(nextRem) ? null : nextRem, undefined, undefined, nextRemRaw);
        }
      }
    } else {
      const prevRaw = curAns?.rawInput ?? (curAns?.answer !== null && curAns?.answer !== undefined ? curAns.answer.toString() : '');
      if (digit === '.') {
        if (currentProblem.category === 'decimal' && !prevRaw.includes('.')) {
          const nextRaw = prevRaw === '' ? '0.' : prevRaw + '.';
          setUserAnswer(currentProblem.id, parseFloat(nextRaw) || 0, undefined, undefined, nextRaw);
        }
      } else {
        const nextRaw = prevRaw + digit;
        if (currentProblem.category === 'decimal') {
          const nextAns = parseFloat(nextRaw);
          setUserAnswer(currentProblem.id, isNaN(nextAns) ? null : nextAns, undefined, undefined, nextRaw);
        } else {
          const nextAns = parseInt(nextRaw, 10);
          setUserAnswer(currentProblem.id, isNaN(nextAns) ? null : nextAns, undefined, undefined, nextRaw);
        }
      }
    }
  };

  const handleKeypadBackspace = () => {
    if (!currentProblem) return;
    const curAns = useWorksheetStore.getState().userAnswers[currentProblem.id];

    if (currentProblem.category === 'fraction') {
      const curFrac: FractionValue = curAns?.fractionAnswer || { numerator: 0, denominator: 1 };
      if (activeInputType === 'whole') {
        const prevStr = curFrac.whole !== undefined && curFrac.whole !== null ? curFrac.whole.toString() : '';
        if (prevStr.length <= 1) {
          setUserAnswer(currentProblem.id, undefined, undefined, { ...curFrac, whole: undefined });
        } else {
          const nextVal = parseInt(prevStr.slice(0, -1), 10);
          setUserAnswer(currentProblem.id, undefined, undefined, { ...curFrac, whole: isNaN(nextVal) ? undefined : nextVal });
        }
      } else if (activeInputType === 'num') {
        const prevStr = curFrac.numerator ? curFrac.numerator.toString() : '';
        if (prevStr.length <= 1) {
          setUserAnswer(currentProblem.id, undefined, undefined, { ...curFrac, numerator: 0 });
        } else {
          const nextVal = parseInt(prevStr.slice(0, -1), 10);
          setUserAnswer(currentProblem.id, undefined, undefined, { ...curFrac, numerator: isNaN(nextVal) ? 0 : nextVal });
        }
      } else if (activeInputType === 'den') {
        const prevStr = curFrac.denominator ? curFrac.denominator.toString() : '';
        if (prevStr.length <= 1) {
          setUserAnswer(currentProblem.id, undefined, undefined, { ...curFrac, denominator: 1 });
        } else {
          const nextVal = parseInt(prevStr.slice(0, -1), 10);
          setUserAnswer(currentProblem.id, undefined, undefined, { ...curFrac, denominator: isNaN(nextVal) || nextVal === 0 ? 1 : nextVal });
        }
      }
      return;
    }

    if (activeInputType === 'remainder' && isDivisionWithRemainder) {
      const prevRem =
        curAns?.rawRemainder ??
        (curAns?.remainder !== null && curAns?.remainder !== undefined
          ? curAns.remainder.toString()
          : '');
      if (prevRem.length <= 1) {
        setUserAnswer(currentProblem.id, undefined, null, undefined, undefined, '');
      } else {
        const nextRemRaw = prevRem.slice(0, -1);
        if (currentProblem.category === 'decimal') {
          const nextRem = parseFloat(nextRemRaw);
          setUserAnswer(currentProblem.id, undefined, isNaN(nextRem) ? null : nextRem, undefined, undefined, nextRemRaw);
        } else {
          const nextRem = parseInt(nextRemRaw, 10);
          setUserAnswer(currentProblem.id, undefined, isNaN(nextRem) ? null : nextRem, undefined, undefined, nextRemRaw);
        }
      }
    } else {
      const prevRaw = curAns?.rawInput ?? (curAns?.answer !== null && curAns?.answer !== undefined ? curAns.answer.toString() : '');
      if (prevRaw.length <= 1) {
        setUserAnswer(currentProblem.id, null, undefined, undefined, '');
      } else {
        const nextRaw = prevRaw.slice(0, -1);
        if (currentProblem.category === 'decimal') {
          const nextAns = parseFloat(nextRaw);
          setUserAnswer(currentProblem.id, isNaN(nextAns) ? null : nextAns, undefined, undefined, nextRaw);
        } else {
          const nextAns = parseInt(nextRaw, 10);
          setUserAnswer(currentProblem.id, isNaN(nextAns) ? null : nextAns, undefined, undefined, nextRaw);
        }
      }
    }
  };

  const handleKeypadClear = () => {
    if (!currentProblem) return;
    if (currentProblem.category === 'fraction') {
      setUserAnswer(currentProblem.id, undefined, undefined, { numerator: 0, denominator: 1 });
      return;
    }
    if (activeInputType === 'remainder' && isDivisionWithRemainder) {
      setUserAnswer(currentProblem.id, undefined, null, undefined, undefined, '');
    } else {
      setUserAnswer(currentProblem.id, null, undefined, undefined, '');
    }
  };

  // 음수 부호 토글 핸들러
  const handleToggleNegative = () => {
    if (!currentProblem || currentProblem.category === 'fraction') return;
    const curAns = useWorksheetStore.getState().userAnswers[currentProblem.id];
    const prevRaw = curAns?.rawInput ?? (curAns?.answer !== null && curAns?.answer !== undefined ? curAns.answer.toString() : '');
    let nextRaw = '';
    if (prevRaw.startsWith('-')) {
      nextRaw = prevRaw.slice(1);
    } else if (prevRaw !== '' && prevRaw !== '0') {
      nextRaw = '-' + prevRaw;
    } else {
      nextRaw = '-';
    }

    if (nextRaw === '' || nextRaw === '-') {
      setUserAnswer(currentProblem.id, null, undefined, undefined, nextRaw);
    } else {
      const parsed = currentProblem.category === 'decimal' ? parseFloat(nextRaw) : parseInt(nextRaw, 10);
      setUserAnswer(currentProblem.id, isNaN(parsed) ? null : parsed, undefined, undefined, nextRaw);
    }
  };

  const handleSubmit = async () => {
    if (!currentProblem) return;
    const curAns = useWorksheetStore.getState().userAnswers[currentProblem.id];

    // 현재 문제 입력값 확인
    if (currentProblem.category === 'fraction') {
      const frac = curAns?.fractionAnswer;
      const hasWholeOnly =
        frac?.whole !== undefined &&
        frac?.whole !== null &&
        (!frac.numerator || frac.numerator === 0);
      const hasFrac = Boolean(
        frac &&
        frac.numerator !== undefined &&
        frac.numerator !== null &&
        frac.denominator &&
        frac.denominator > 0
      );

      if (!hasWholeOnly && !hasFrac) {
        alert('답(자연수 또는 분수)을 입력해 주세요.');
        return;
      }

      // 자연수만 입력된 경우 분자 0, 분모 1로 정규화하여 저장
      if (hasWholeOnly && (!frac?.denominator || frac.denominator === 0)) {
        setUserAnswer(currentProblem.id, undefined, undefined, {
          whole: frac.whole,
          numerator: 0,
          denominator: 1,
        });
      }
    } else {
      if (curAns?.answer === null || curAns?.answer === undefined) {
        alert('답을 입력해 주세요.');
        return;
      }
    }

    if (
      isDivisionWithRemainder &&
      (curAns?.remainder === null || curAns?.remainder === undefined)
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

      const updatedAnswers = useWorksheetStore.getState().userAnswers;
      const allCorrect = areAllProblemsCorrect(updatedAnswers);
      const isLastProblem = currentIndex === problems.length - 1;
      const allAnswered = areAllProblemsAnswered(updatedAnswers);

      if (allCorrect) {
        // 마지막 문제까지 모두 맞혔거나 모든 문제가 정답인 경우 자동 채점 및 결과 이동
        setTimeout(async () => {
          await autoFinishPractice();
        }, 600);
        return;
      }

      setTimeout(() => {
        setFeedback(null);
        if (isLastProblem || allAnswered) {
          // 마지막 문제이거나 모든 문제를 푼 상태에서 오답이 남아있는 경우 제출 버튼으로 포커스 이동
          focusFinishButton();
        } else {
          const nextIdx = getNextPendingProblemIndex(currentIndex + 1);
          setCurrentIndex(nextIdx);
          if (problems[nextIdx]?.category === 'fraction') {
            setActiveInputType('num');
            setActiveFractionPart('num');
          } else {
            setActiveInputType('answer');
          }
        }
      }, 600);
    } else {
      // 즉시 채점 꺼짐 모드
      const currentAnswers = useWorksheetStore.getState().userAnswers;
      const allCorrect = areAllProblemsCorrect(currentAnswers);
      const isLastProblem = currentIndex === problems.length - 1;
      const allAnswered = areAllProblemsAnswered(currentAnswers);

      if (allCorrect) {
        autoFinishPractice();
      } else if (isLastProblem || allAnswered) {
        focusFinishButton();
      } else {
        if (currentIndex < problems.length - 1) {
          nextProblem();
          if (problems[currentIndex + 1]?.category === 'fraction') {
            setActiveInputType('num');
            setActiveFractionPart('num');
          } else {
            setActiveInputType('answer');
          }
        }
      }
    }
  };

  const handleNextProblem = () => {
    const curAns = useWorksheetStore.getState().userAnswers[currentProblem.id];
    const hasAnswer =
      currentProblem.category === 'fraction'
        ? Boolean(curAns?.fractionAnswer && curAns.fractionAnswer.numerator !== undefined && curAns.fractionAnswer.denominator)
        : curAns?.answer !== null && curAns?.answer !== undefined && !isNaN(Number(curAns?.answer));

    if (isImmediateGrading && hasAnswer && !curAns?.submittedAt) {
      handleSubmit();
    } else {
      if (currentIndex < problems.length - 1) {
        nextProblem();
        if (problems[currentIndex + 1]?.category === 'fraction') {
          setActiveInputType('num');
          setActiveFractionPart('num');
        } else {
          setActiveInputType('answer');
        }
      } else {
        focusFinishButton();
      }
    }
  };

  // 그리드 모드에서 정답 작성 시 다음 미정답 문제 입력칸으로 자동 커서 이동 및 마지막 문제 시 자동 채점/포커스
  const advanceGridIfCorrect = (problem: (typeof problems)[0], updatedAns: (typeof userAnswers)[string], idx: number) => {
    if (!isImmediateGrading) return;
    const isProbCorrect = evaluateProblemAnswer(problem, updatedAns);
    if (isProbCorrect) {
      if (soundEnabled) playCorrectSound();
      const nextAnswers = { ...userAnswers, [problem.id]: updatedAns };
      let nextIdx = idx + 1;
      while (nextIdx < problems.length) {
        const nextP = problems[nextIdx];
        const nextA = nextAnswers[nextP.id];
        if (!nextA || !evaluateProblemAnswer(nextP, nextA)) break;
        nextIdx++;
      }
      if (nextIdx < problems.length) {
        setTimeout(() => {
          setFocusedGridIndex(nextIdx);
          gridCardRefs.current[nextIdx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 120);
      } else {
        // idx + 1 이후로 남은 문제가 없거나 마지막 문제를 푼 경우
        const allCorrect = areAllProblemsCorrect(nextAnswers);
        if (allCorrect) {
          // 모든 문제가 정답인 경우: 자동 제출 및 채점
          setTimeout(async () => {
            await autoFinishPractice();
          }, 350);
        } else {
          // 마지막 문제이거나 더 이상 진행할 뒤쪽 문제가 없지만 이전 문제 중 오답/미작성이 존재하는 경우:
          // 제출 버튼으로 포커스 이동
          focusFinishButton();
        }
      }
    }
  };

  const handleFinishAll = async () => {
    if (isSubmittingRef.current) return;
    const state = useWorksheetStore.getState();
    const unanswered = state.problems.filter((p) => {
      const a = state.userAnswers[p.id];
      if (p.category === 'fraction') {
        return !a?.fractionAnswer || a.fractionAnswer.numerator === undefined || !a.fractionAnswer.denominator;
      }
      return a?.answer === null || a?.answer === undefined;
    });

    if (unanswered.length > 0) {
      const confirmSubmit = window.confirm(
        `아직 답을 입력하지 않은 문제가 ${unanswered.length}개 있습니다. 그래도 채점하시겠습니까?`
      );
      if (!confirmSubmit) return;
    }

    isSubmittingRef.current = true;
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
    (a) =>
      (a.answer !== null && a.answer !== undefined) ||
      (a.fractionAnswer && a.fractionAnswer.numerator !== undefined && a.fractionAnswer.denominator)
  ).length;
  const isLastProblem = currentIndex === problems.length - 1;

  // 실시간 즉시 채점 현황 집계
  let liveCorrectCount = 0;
  let liveIncorrectCount = 0;
  problems.forEach((p) => {
    const a = userAnswers[p.id];
    const hasAnswer =
      p.category === 'fraction'
        ? Boolean(a?.fractionAnswer && a.fractionAnswer.numerator !== undefined && a.fractionAnswer.denominator)
        : a?.answer !== null && a?.answer !== undefined && !isNaN(Number(a.answer));
    if (hasAnswer) {
      if (evaluateProblemAnswer(p, a)) {
        liveCorrectCount++;
      } else {
        liveIncorrectCount++;
      }
    }
  });
  const totalCount = problems.length;
  const currentEarnedScore =
    totalCount > 0 ? Math.round((liveCorrectCount / totalCount) * 100) : 0;
  const liveEvaluated = liveCorrectCount + liveIncorrectCount;
  const accuracyRate =
    liveEvaluated > 0 ? Math.round((liveCorrectCount / liveEvaluated) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-2 sm:space-y-6 pb-2 sm:pb-12">
      {/* 상단 컨트롤 바 */}
      <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs sm:shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center justify-between sm:justify-start flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="text-[11px] sm:text-xs font-bold text-slate-600 flex items-center gap-1.5 sm:gap-2">
            <span>
              푼 문제: <span className="text-emerald-600 font-black">{answeredCount}</span> / {problems.length}
            </span>

            {/* 즉시 채점 켜짐 상태일 때 실시간 채점 현황 표시 (총 100점 만점 기준 맞힌 문제에 따라 실시간 득점) */}
            {isImmediateGrading && (
              <span className="inline-flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 animate-in fade-in duration-150">
                <span className="inline-flex items-center gap-0.5 text-emerald-600 font-extrabold" title="정답 수">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {liveCorrectCount}
                </span>
                <span className="inline-flex items-center gap-0.5 text-rose-500 font-extrabold" title="오답 수">
                  <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {liveIncorrectCount}
                </span>
                <span
                  className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-black text-[10.5px] sm:text-[11px] rounded border border-emerald-200"
                  title="총 문항 수(100점 만점) 기준 현재 획득 점수"
                >
                  현재 {currentEarnedScore}점
                </span>
                {liveIncorrectCount > 0 && (
                  <span className="text-[10px] sm:text-[10.5px] text-slate-400 font-semibold" title="푼 문제 중 정답률">
                    ({accuracyRate}%)
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* 뷰 모드 토글 (한 문제씩 / 한꺼번에) & 즉시 채점 토글 */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
          <div className="bg-slate-100 p-0.5 sm:p-1 rounded-lg sm:rounded-xl flex items-center">
            <button
              onClick={() => setPracticeViewMode('single')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                practiceViewMode === 'single'
                  ? 'bg-white text-slate-900 shadow-xs sm:shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              한 문제씩
            </button>
            <button
              onClick={() => setPracticeViewMode('grid')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                practiceViewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs sm:shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              한꺼번에
            </button>
          </div>

          {/* 즉시 채점 토글 */}
          <button
            onClick={() => setIsImmediateGrading(!isImmediateGrading)}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold border transition-colors ${
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
        <div className="space-y-2 sm:space-y-5">
          {/* 진행 바 */}
          <div className="w-full bg-slate-200 h-1.5 sm:h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }}
            />
          </div>

          {/* 메인 문제 카드 */}
          <div className="bg-white px-3 py-2.5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs sm:shadow-sm text-center relative overflow-hidden">
            {/* 정답/오답 즉시 피드백 오버레이 */}
            {feedback === 'correct' && (
              <div className="absolute inset-0 bg-emerald-500/15 backdrop-blur-xs flex items-center justify-center z-10 animate-in zoom-in-95 duration-150">
                <div className="bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl border-2 border-emerald-500 flex items-center gap-2 text-emerald-700 font-black text-lg sm:text-xl">
                  <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                  정답입니다! 🎉
                </div>
              </div>
            )}
            {feedback === 'incorrect' && (
              <div className="absolute inset-0 bg-rose-500/15 backdrop-blur-xs flex items-center justify-center z-10 animate-in zoom-in-95 duration-150">
                <div className="bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl border-2 border-rose-500 flex items-center gap-2 text-rose-700 font-black text-lg sm:text-xl">
                  <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-rose-600" />
                  다시 계산해 보세요!
                </div>
              </div>
            )}

            {/* 문제 번호 & 지시문 */}
            <div className="flex items-center justify-between pb-1.5 sm:pb-3 mb-1.5 sm:mb-4 border-b border-slate-100">
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-[11px] sm:text-xs font-black">
                문제 {currentIndex + 1} / {problems.length}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-400">
                {currentProblem.operation === 'division' && currentProblem.remainder !== undefined
                  ? '몫과 나머지를 구해 보세요.'
                  : '계산해 보세요.'}
              </span>
            </div>

            {/* 수식 렌더링 */}
            <div className="py-1 sm:py-6 flex justify-center items-center">
              <div className="scale-105 sm:scale-125 transform transition-transform my-0.5 sm:my-2">
                <UniversalProblem
                  key={currentProblem.id}
                  problem={currentProblem}
                  userAnswer={currentAnswer?.answer}
                  userRemainder={currentAnswer?.remainder}
                  userFraction={currentAnswer?.fractionAnswer}
                  rawInput={currentAnswer?.rawInput}
                  rawRemainder={currentAnswer?.rawRemainder}
                  autoFocus={practiceViewMode === 'single'}
                  activeInputType={activeInputType}
                  activeFractionPart={activeFractionPart}
                  onFocusFractionPart={(part) => {
                    setActiveInputType(part);
                    setActiveFractionPart(part);
                  }}
                  onFocusAnswer={() => setActiveInputType('answer')}
                  onFocusRemainder={() => setActiveInputType('remainder')}
                  onSubmit={handleSubmit}
                  virtualKeyboard={true}
                  onAnswerChange={(val) =>
                    setUserAnswer(currentProblem.id, val, undefined, undefined)
                  }
                  onRemainderChange={(val, raw) =>
                    setUserAnswer(currentProblem.id, undefined, val, undefined, undefined, raw)
                  }
                  onFractionChange={(val) =>
                    setUserAnswer(currentProblem.id, undefined, undefined, val)
                  }
                />
              </div>
            </div>

            {/* 분수의 경우 자연수/분자/분모 입력 탭 선택 버튼 */}
            {currentProblem.category === 'fraction' && (
              <div className="flex justify-center gap-2 mt-1 sm:mt-3">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setActiveInputType('whole');
                    setActiveFractionPart('whole');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeInputType === 'whole'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  자연수(대분수)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setActiveInputType('num');
                    setActiveFractionPart('num');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeInputType === 'num'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  분자 입력
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setActiveInputType('den');
                    setActiveFractionPart('den');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeInputType === 'den'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  분모 입력
                </button>
              </div>
            )}

            {/* 나눗셈의 경우 몫/나머지 입력 탭 선택 버튼 */}
            {currentProblem.operation === 'division' && currentProblem.remainder !== undefined && (
              <div className="flex justify-center gap-2 mt-1 sm:mt-3">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setActiveInputType('answer')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeInputType === 'answer'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  몫 입력 중
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setActiveInputType('remainder')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeInputType === 'remainder'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  나머지 입력 중
                </button>
              </div>
            )}
          </div>

          {/* 문제 이동 버튼 및 가상 키패드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 items-center">
            {/* 데스크톱 전용 안내 패널 (모바일에서는 숨김) */}
            <div className="hidden md:flex flex-col justify-between h-full bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg mb-2">💡 스마트 연산 팁</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  키보드의 <strong>숫자 키(0~9)</strong>와 <strong>Enter 키</strong>로 화면 키패드를 터치하지 않고도 빠르게 입력할 수 있습니다.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
                  <div>• 이전/다음 이동: 키패드 하단 [이전], [다음] 버튼</div>
                  <div>• 한 글자 지우기: Backspace 키 또는 키패드 ⌫</div>
                  <div>• {isImmediateGrading ? '현재 즉시 채점 모드 동작 중' : '즉시 채점 꺼짐 (최종 제출 시 일괄 채점)'}</div>
                </div>
              </div>

              {/* 완료 및 채점하기 버튼 (데스크톱) */}
              <button
                ref={desktopFinishButtonRef}
                type="button"
                onClick={handleFinishAll}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-base font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 mt-6 focus:outline-none focus:ring-4 focus:ring-emerald-400 focus:ring-offset-2"
              >
                <Check className="w-5 h-5 stroke-[3] text-emerald-400" />
                {isLastProblem ? '모두 풀었습니다 (최종 제출)' : '중간 채점 및 제출'}
              </button>
            </div>

            {/* 어린이 터치 친화형 숫자 키패드 */}
            <div className="w-full flex flex-col items-center">
              <ChildKeypad
                onDigit={handleKeypadDigit}
                onBackspace={handleKeypadBackspace}
                onClear={handleKeypadClear}
                onSubmit={handleSubmit}
                onPrev={prevProblem}
                onNext={handleNextProblem}
                canPrev={currentIndex > 0}
                canNext={currentIndex < problems.length - 1}
                allowNegative={currentRule.allowNegative}
                allowDecimal={currentProblem.category === 'decimal'}
                onToggleNegative={handleToggleNegative}
              />

              {/* 모바일 전용 완료 버튼 (키패드 바로 아래 배치) */}
              <button
                ref={mobileFinishButtonRef}
                type="button"
                onClick={handleFinishAll}
                className="md:hidden w-full max-w-sm mt-2 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-98 focus:outline-none focus:ring-4 focus:ring-emerald-400 focus:ring-offset-2"
              >
                <Check className="w-4 h-4 stroke-[3] text-emerald-400" />
                {isLastProblem ? '모두 풀었습니다 (최종 제출)' : '중간 채점 및 제출'}
              </button>
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
                problem.category === 'fraction'
                  ? Boolean(ans?.fractionAnswer && ans.fractionAnswer.numerator !== undefined && ans.fractionAnswer.denominator)
                  : ans?.answer !== null && ans?.answer !== undefined && !isNaN(Number(ans?.answer));

              const isProbCorrect = hasAnswer ? evaluateProblemAnswer(problem, ans) : null;

              const cardBorderClass =
                isImmediateGrading && hasAnswer
                  ? isProbCorrect
                    ? 'border-2 border-emerald-500 bg-emerald-50/35 shadow-sm'
                    : 'border-2 border-rose-400 bg-rose-50/30'
                  : 'border border-slate-200 bg-white';

              return (
                <div
                  key={problem.id}
                  ref={(el) => { gridCardRefs.current[idx] = el; }}
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
                    <UniversalProblem
                      key={problem.id}
                      problem={problem}
                      userAnswer={ans?.answer}
                      userRemainder={ans?.remainder}
                      userFraction={ans?.fractionAnswer}
                      rawInput={ans?.rawInput}
                      rawRemainder={ans?.rawRemainder}
                      autoFocus={focusedGridIndex === idx}
                      onFocus={() => setFocusedGridIndex(idx)}
                      onSubmit={() => {
                        if (isImmediateGrading && soundEnabled && hasAnswer) {
                          if (isProbCorrect) playCorrectSound();
                          else playIncorrectSound();
                        }
                        if (isImmediateGrading) {
                          if (isProbCorrect && ans) {
                            advanceGridIfCorrect(problem, ans, idx);
                          } else if (idx === problems.length - 1) {
                            // 마지막 문제에서 오답 또는 미완성 상태로 엔터 입력 시 채점 버튼으로 포커스 이동
                            focusFinishButton();
                          }
                        } else {
                          // 즉시 채점 꺼짐 모드
                          if (idx === problems.length - 1) {
                            const stateAnswers = useWorksheetStore.getState().userAnswers;
                            if (areAllProblemsCorrect(stateAnswers)) {
                              autoFinishPractice();
                            } else {
                              focusFinishButton();
                            }
                          } else {
                            setFocusedGridIndex(idx + 1);
                            gridCardRefs.current[idx + 1]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }
                        }
                      }}
                      onAnswerChange={(val) => {
                        setUserAnswer(problem.id, val, undefined, undefined);
                        const updated = { ...(ans || { problemId: problem.id }), answer: val };
                        advanceGridIfCorrect(problem, updated, idx);
                      }}
                      onRemainderChange={(val, raw) => {
                        setUserAnswer(problem.id, undefined, val, undefined, undefined, raw);
                        const updated = { ...(ans || { problemId: problem.id }), remainder: val, rawRemainder: raw };
                        advanceGridIfCorrect(problem, updated, idx);
                      }}
                      onFractionChange={(val) => {
                        setUserAnswer(problem.id, undefined, undefined, val);
                        const updated = { ...(ans || { problemId: problem.id }), fractionAnswer: val };
                        advanceGridIfCorrect(problem, updated, idx);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 하단 일괄 채점하기 버튼 */}
          <div className="text-center pt-4">
            <button
              ref={gridFinishButtonRef}
              type="button"
              onClick={handleFinishAll}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-lg font-black rounded-2xl shadow-lg transition-all active:scale-98 inline-flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-emerald-400 focus:ring-offset-2"
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
