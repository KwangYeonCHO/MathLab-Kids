/**
 * MathLab Kids 메인 애플리케이션 상태 관리 (Zustand)
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WorksheetRule, Problem, UserAnswer, SessionResult } from '../domain/math/types';
import { GRADE_PRESETS } from '../domain/math/presets';
import { generateWorksheet } from '../domain/math/generators/engine';
import { resolveRuleTitle } from '../domain/math/ruleTitle';
import { saveSessionResult, saveInProgressSession } from '../db/historyDb';

interface WorksheetState {
  currentRule: WorksheetRule;
  problems: Problem[];
  generationError: string | null;
  currentIndex: number;
  userAnswers: Record<string, UserAnswer>;
  isImmediateGrading: boolean;
  practiceViewMode: 'single' | 'grid'; // 'single': 한 문제씩, 'grid': 여러 문제 한꺼번에
  startTime: number | null;
  problemStartTime: number;
  lastResult: SessionResult | null;
  soundEnabled: boolean;

  // 액션
  setRule: (ruleOrUpdater: Partial<WorksheetRule> | ((prev: WorksheetRule) => WorksheetRule)) => void;
  resetRuleToDefault: () => void;
  loadPreset: (presetId: string) => void;
  generateNewProblems: () => boolean;
  setUserAnswer: (problemId: string, answer?: number | null, remainder?: number | null) => void;
  submitCurrentAnswer: () => boolean; // 정답 여부 반환
  nextProblem: () => void;
  prevProblem: () => void;
  setCurrentIndex: (index: number) => void;
  setPracticeViewMode: (mode: 'single' | 'grid') => void;
  setIsImmediateGrading: (enabled: boolean) => void;
  toggleSound: () => void;
  startPractice: () => void;
  finishPractice: () => Promise<SessionResult>;
  retryMistakes: (mode?: 'original' | 'new_like') => void;
  retryWithSameRule: () => void;
  restoreSession: (
    rule: WorksheetRule,
    problems: Problem[],
    userAnswers: Record<string, UserAnswer>,
    currentIndex: number
  ) => void;
}

const defaultRule = GRADE_PRESETS[1].rule; // 2학년 받아올림 덧셈 기본

export const useWorksheetStore = create<WorksheetState>()(
  persist(
    (set, get) => ({
      currentRule: defaultRule,
  problems: [],
  generationError: null,
  currentIndex: 0,
  userAnswers: {},
  isImmediateGrading: true,
  practiceViewMode: 'single',
  startTime: null,
  problemStartTime: Date.now(),
  lastResult: null,
  soundEnabled: true,

  setRule: (ruleOrUpdater) => {
    set((state) => {
      const nextRuleRaw = typeof ruleOrUpdater === 'function' ? ruleOrUpdater(state.currentRule) : { ...state.currentRule, ...ruleOrUpdater };
      const nextTitle = resolveRuleTitle(nextRuleRaw);
      const nextRule = { ...nextRuleRaw, title: nextTitle };
      return { currentRule: nextRule };
    });
    get().generateNewProblems();
  },

  resetRuleToDefault: () => {
    set({ currentRule: defaultRule });
    get().generateNewProblems();
  },

  loadPreset: (presetId) => {
    const preset = GRADE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      set({ currentRule: { ...preset.rule } });
      get().generateNewProblems();
    }
  },

  generateNewProblems: () => {
    const { currentRule } = get();
    const result = generateWorksheet(currentRule);
    if (result.success && result.problems.length > 0) {
      set({
        problems: result.problems,
        generationError: null,
        currentIndex: 0,
        userAnswers: {},
      });
      return true;
    } else {
      set({
        generationError: result.errorMessage || '문제를 생성하지 못했습니다. 조건을 변경해 주세요.',
      });
      return false;
    }
  },

  setUserAnswer: (problemId, answer, remainder) => {
    const state = get();
    const currentAns = state.userAnswers[problemId] || {
      problemId,
      answer: null,
      remainder: null,
    };

    const updated: UserAnswer = {
      ...currentAns,
      answer: answer !== undefined ? answer : currentAns.answer,
      remainder: remainder !== undefined ? remainder : currentAns.remainder,
    };

    const nextAnswers = {
      ...state.userAnswers,
      [problemId]: updated,
    };

    set({ userAnswers: nextAnswers });

    // 자동 임시 저장
    saveInProgressSession(state.currentRule, state.problems, nextAnswers, state.currentIndex);
  },

  submitCurrentAnswer: () => {
    const state = get();
    const currentProb = state.problems[state.currentIndex];
    if (!currentProb) return false;

    const userAns = state.userAnswers[currentProb.id];
    if (!userAns || userAns.answer === null || userAns.answer === undefined || isNaN(Number(userAns.answer))) return false;

    // 정답 판정
    let isCorrect = Number(userAns.answer) === currentProb.answer;
    if (currentProb.operation === 'division' && currentProb.remainder !== undefined) {
      const userRem = userAns.remainder !== null && userAns.remainder !== undefined && !isNaN(Number(userAns.remainder)) ? Number(userAns.remainder) : 0;
      isCorrect = isCorrect && userRem === currentProb.remainder;
    }

    const timeSpent = Date.now() - state.problemStartTime;

    const nextAnswers: Record<string, UserAnswer> = {
      ...state.userAnswers,
      [currentProb.id]: {
        ...userAns,
        isCorrect,
        timeSpentMs: (userAns.timeSpentMs || 0) + timeSpent,
        submittedAt: new Date().toISOString(),
        firstAttemptCorrect: userAns.firstAttemptCorrect ?? isCorrect,
      },
    };

    set({
      userAnswers: nextAnswers,
      problemStartTime: Date.now(),
    });

    saveInProgressSession(state.currentRule, state.problems, nextAnswers, state.currentIndex);
    return isCorrect;
  },

  nextProblem: () => {
    const { currentIndex, problems } = get();
    if (currentIndex < problems.length - 1) {
      set({
        currentIndex: currentIndex + 1,
        problemStartTime: Date.now(),
      });
    }
  },

  prevProblem: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({
        currentIndex: currentIndex - 1,
        problemStartTime: Date.now(),
      });
    }
  },

  setCurrentIndex: (index) => {
    set({ currentIndex: index, problemStartTime: Date.now() });
  },

  setPracticeViewMode: (mode) => {
    set({ practiceViewMode: mode });
  },

  setIsImmediateGrading: (enabled) => {
    set({ isImmediateGrading: enabled });
  },

  toggleSound: () => {
    set((s) => ({ soundEnabled: !s.soundEnabled }));
  },

  startPractice: () => {
    set({
      currentIndex: 0,
      userAnswers: {},
      startTime: Date.now(),
      problemStartTime: Date.now(),
    });
  },

  finishPractice: async () => {
    const state = get();
    const now = Date.now();
    const totalTimeSpentMs = state.startTime ? now - state.startTime : 0;

    let correctCount = 0;
    let incorrectCount = 0;

    const finalizedAnswers: Record<string, UserAnswer> = {};

    state.problems.forEach((prob) => {
      const userAns = state.userAnswers[prob.id];
      const ansVal = userAns?.answer;
      const remVal = userAns?.remainder;

      const hasAnswer =
        ansVal !== null &&
        ansVal !== undefined &&
        !isNaN(Number(ansVal)) &&
        String(ansVal).trim() !== '';
      let isCorrect = hasAnswer && Number(ansVal) === prob.answer;
      if (prob.operation === 'division' && prob.remainder !== undefined) {
        const hasRem =
          remVal !== null &&
          remVal !== undefined &&
          !isNaN(Number(remVal)) &&
          String(remVal).trim() !== '';
        const userRem = hasRem ? Number(remVal) : 0;
        isCorrect = isCorrect && userRem === prob.remainder;
      }

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      finalizedAnswers[prob.id] = {
        problemId: prob.id,
        answer: hasAnswer ? Number(ansVal) : null,
        remainder:
          remVal !== null &&
          remVal !== undefined &&
          !isNaN(Number(remVal)) &&
          String(remVal).trim() !== ''
            ? Number(remVal)
            : null,
        isCorrect,
        timeSpentMs: userAns?.timeSpentMs ?? 0,
        submittedAt: userAns?.submittedAt ?? new Date().toISOString(),
      };
    });

    const evaluatedTotal = correctCount + incorrectCount;
    const accuracyRate = evaluatedTotal > 0 ? Math.round((correctCount / evaluatedTotal) * 100) : 0;
    const averageTimeSpentMs = evaluatedTotal > 0 ? Math.round(totalTimeSpentMs / evaluatedTotal) : 0;

    const result: SessionResult = {
      id: `session-${Date.now()}`,
      title: state.currentRule.title || resolveRuleTitle(state.currentRule) || '수학 연산 연습',
      createdAt: new Date().toISOString(),
      totalCount: evaluatedTotal,
      correctCount,
      incorrectCount,
      accuracyRate,
      totalTimeSpentMs,
      averageTimeSpentMs,
      problems: state.problems,
      userAnswers: finalizedAnswers,
      rule: state.currentRule,
    };

    await saveSessionResult(result);
    set({ lastResult: result, userAnswers: finalizedAnswers });
    return result;
  },

  retryMistakes: (mode = 'original') => {
    const state = get();
    if (!state.lastResult) return;

    // 오답 문제만 필터링 (온라인 풀이의 모든 문제 대상)
    const wrongProblems = state.lastResult.problems.filter((p) => {
      const ans = state.lastResult?.userAnswers[p.id];
      return !ans || !ans.isCorrect;
    });

    if (wrongProblems.length === 0) return;

    if (mode === 'original') {
      const resetProblems = wrongProblems.map((p, idx) => ({
        ...p,
        index: idx + 1,
        isExample: false,
      }));
      set({
        problems: resetProblems,
        userAnswers: {},
        currentIndex: 0,
        startTime: Date.now(),
        problemStartTime: Date.now(),
      });
    } else {
      // 같은 규칙으로 틀린 개수만큼 새 문제 생성
      const tempRule: WorksheetRule = {
        ...state.currentRule,
        count: wrongProblems.length,
        showFirstExample: false,
      };
      const res = generateWorksheet(tempRule);
      if (res.success && res.problems.length > 0) {
        set({
          problems: res.problems,
          userAnswers: {},
          currentIndex: 0,
          startTime: Date.now(),
          problemStartTime: Date.now(),
        });
      }
    }
  },

  retryWithSameRule: () => {
    const state = get();
    const success = get().generateNewProblems();
    if (success) {
      get().startPractice();
    }
  },

  restoreSession: (rule, problems, userAnswers, currentIndex) => {
    set({
      currentRule: rule,
      problems,
      userAnswers,
      currentIndex,
      startTime: Date.now(),
      problemStartTime: Date.now(),
    });
  },
}),
    {
      name: 'mathlab_kids_rule_storage_v1',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        currentRule: state.currentRule,
        soundEnabled: state.soundEnabled,
        isImmediateGrading: state.isImmediateGrading,
        practiceViewMode: state.practiceViewMode,
        lastResult: state.lastResult,
      }),
    }
  )
);
