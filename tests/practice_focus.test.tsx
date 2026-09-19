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
});
