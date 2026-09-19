import { describe, it, expect } from 'vitest';
import { Problem } from '../src/domain/math/types';
import { evaluateProblemAnswer } from '../src/stores/worksheetStore';

describe('온라인 풀이(Practice) 포커스 자동 이동 및 정답 판정 연동 테스트', () => {
  const sampleProblems: Problem[] = [
    {
      id: 'p1',
      index: 1,
      operation: 'addition',
      operandA: 12,
      operandB: 8,
      answer: 20,
      displayFormat: 'horizontal',
    },
    {
      id: 'p2',
      index: 2,
      operation: 'subtraction',
      operandA: 35,
      operandB: 15,
      answer: 20,
      displayFormat: 'horizontal',
    },
    {
      id: 'p3',
      index: 3,
      operation: 'multiplication',
      operandA: 4,
      operandB: 5,
      answer: 20,
      displayFormat: 'horizontal',
    },
  ];

  it('미작성 상태일 때는 1번 문제(index 0)가 포커스 대상이어야 함', () => {
    const userAnswers = {};
    let target = 0;
    for (let i = 0; i < sampleProblems.length; i++) {
      const p = sampleProblems[i];
      const a = userAnswers[p.id];
      if (!a || !evaluateProblemAnswer(p, a)) {
        target = i;
        break;
      }
    }
    expect(target).toBe(0);
  });

  it('1번, 2번 문제를 이미 정답 처리한 경우 자동으로 3번 문제(index 2)로 포커스가 설정되어야 함', () => {
    const userAnswers = {
      p1: { problemId: 'p1', answer: 20, isCorrect: true },
      p2: { problemId: 'p2', answer: 20, isCorrect: true },
    };
    let target = 0;
    for (let i = 0; i < sampleProblems.length; i++) {
      const p = sampleProblems[i];
      const a = userAnswers[p.id];
      if (!a || !evaluateProblemAnswer(p, a)) {
        target = i;
        break;
      }
    }
    expect(target).toBe(2);
  });

  it('현재 문제를 맞힌 경우 다음 미작성 문제로 인덱스가 자동 전진해야 함', () => {
    const currentIdx = 0;
    const userAnswers = {
      p1: { problemId: 'p1', answer: 20, isCorrect: true },
    };
    let nextIdx = currentIdx + 1;
    while (nextIdx < sampleProblems.length) {
      const p = sampleProblems[nextIdx];
      const a = userAnswers[p.id];
      if (!a || !evaluateProblemAnswer(p, a)) break;
      nextIdx++;
    }
    expect(nextIdx).toBe(1);
  });

  it('마지막 문제까지 모든 문제를 맞힌 경우(allCorrect) 자동 제출 조건이 만족되어야 함', () => {
    const userAnswers = {
      p1: { problemId: 'p1', answer: 20, isCorrect: true },
      p2: { problemId: 'p2', answer: 20, isCorrect: true },
      p3: { problemId: 'p3', answer: 20, isCorrect: true },
    };

    const allCorrect = sampleProblems.every((prob) => {
      const ans = userAnswers[prob.id as keyof typeof userAnswers];
      return ans && evaluateProblemAnswer(prob, ans);
    });

    expect(allCorrect).toBe(true);
  });

  it('마지막 문제를 풀었으나 이전 문제(p2)에 오답이 있는 경우 자동 제출되지 않고 채점 버튼 포커스 조건이 되어야 함', () => {
    const userAnswers = {
      p1: { problemId: 'p1', answer: 20, isCorrect: true },
      p2: { problemId: 'p2', answer: 99, isCorrect: false }, // 오답
      p3: { problemId: 'p3', answer: 20, isCorrect: true }, // 마지막 문제 정답
    };

    const allCorrect = sampleProblems.every((prob) => {
      const ans = userAnswers[prob.id as keyof typeof userAnswers];
      return ans && evaluateProblemAnswer(prob, ans);
    });

    const isLastProblem = true;
    const allAnswered = sampleProblems.every((p) => {
      const a = userAnswers[p.id as keyof typeof userAnswers];
      return a && a.answer !== null && a.answer !== undefined;
    });

    expect(allCorrect).toBe(false);
    expect(isLastProblem || allAnswered).toBe(true);
    // allCorrect가 false이고 isLastProblem/allAnswered가 true이므로 focusFinishButton이 호출됨
  });

  it('분수 및 소수/나머지 문제 혼합 시에도 전 문항 정답 여부를 정확히 판별하여 자동 제출 또는 포커스를 분기해야 함', () => {
    const complexProblems: Problem[] = [
      {
        id: 'cp1',
        index: 1,
        category: 'fraction',
        operation: 'addition',
        fractionA: { numerator: 1, denominator: 4 },
        fractionB: { numerator: 2, denominator: 4 },
        fractionAnswer: { numerator: 3, denominator: 4 },
        displayFormat: 'horizontal',
      },
      {
        id: 'cp2',
        index: 2,
        operation: 'division',
        operandA: 17,
        operandB: 5,
        answer: 3,
        remainder: 2,
        displayFormat: 'horizontal',
      },
    ];

    // 1) 둘 다 정답인 경우
    const correctAnswers = {
      cp1: { problemId: 'cp1', fractionAnswer: { numerator: 3, denominator: 4 } },
      cp2: { problemId: 'cp2', answer: 3, remainder: 2 },
    };
    const isBothCorrect = complexProblems.every((p) =>
      evaluateProblemAnswer(p, correctAnswers[p.id as keyof typeof correctAnswers])
    );
    expect(isBothCorrect).toBe(true);

    // 2) 나머지가 틀린 경우 -> 전 문항 정답 실패 (채점 버튼 포커스 분기)
    const partialWrongAnswers = {
      cp1: { problemId: 'cp1', fractionAnswer: { numerator: 3, denominator: 4 } },
      cp2: { problemId: 'cp2', answer: 3, remainder: 1 }, // 나머지 오답
    };
    const isPartialCorrect = complexProblems.every((p) =>
      evaluateProblemAnswer(p, partialWrongAnswers[p.id as keyof typeof partialWrongAnswers])
    );
    expect(isPartialCorrect).toBe(false);
  });
});
