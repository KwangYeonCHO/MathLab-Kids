import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ResultPage from '../src/app/result/page';
import { useWorksheetStore } from '../src/stores/worksheetStore';
import { SessionResult, Problem, WorksheetRule } from '../src/domain/math/types';

const { mockSession } = vi.hoisted(() => {
  const mockRule: WorksheetRule = {
    schemaVersion: 1,
    title: '세 수의 덧셈과 뺄셈',
    operations: ['addition', 'subtraction'],
    category: 'arithmetic',
    operandCount: 3,
    count: 2,
    operandA: { digits: [2] },
    operandB: { digits: [1] },
    operandC: { digits: [2] },
    carryCondition: 'any',
    borrowCondition: 'any',
    divisionCondition: 'none',
    allowNegative: false,
    allowZero: false,
    uniqueMode: 'exact',
    displayFormat: 'horizontal',
    showFirstExample: false,
  };

  const mockThreeOperandProblem: Problem = {
    id: 'three-1',
    index: 1,
    operation: 'addition',
    operation2: 'subtraction',
    operandA: 62,
    operandB: 3,
    operandC: 10,
    answer: 55,
    displayFormat: 'horizontal',
  };

  const mockTwoOperandProblem: Problem = {
    id: 'two-2',
    index: 2,
    operation: 'addition',
    operandA: 15,
    operandB: 7,
    answer: 22,
    displayFormat: 'horizontal',
  };

  const session: SessionResult = {
    id: 'test-session-1',
    createdAt: new Date().toISOString(),
    rule: mockRule,
    title: '세 수의 덧셈과 뺄셈',
    totalCount: 2,
    correctCount: 2,
    incorrectCount: 0,
    accuracyRate: 100,
    totalTimeSpentMs: 12000,
    averageTimeSpentMs: 6000,
    problems: [mockThreeOperandProblem, mockTwoOperandProblem],
    userAnswers: {
      'three-1': { answer: 55, isCorrect: true, timeSpentMs: 6000 },
      'two-2': { answer: 22, isCorrect: true, timeSpentMs: 6000 },
    },
  };

  return { mockSession: session };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

vi.mock('@/db/historyDb', () => ({
  getAllSessions: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/stores/worksheetStore', () => ({
  useWorksheetStore: Object.assign(
    vi.fn(() => ({
      lastResult: mockSession,
      retryMistakes: vi.fn(),
      retryWithSameRule: vi.fn(),
    })),
    {
      getState: () => ({ lastResult: mockSession }),
      setState: vi.fn(),
    }
  ),
}));

describe('ResultPage 학습 결과 상세 화면 렌더링 무결성 검증', () => {
  beforeEach(() => {
    useWorksheetStore.setState({ lastResult: mockSession });
  });

  it('세 수의 연산 문제에서 피연산자 A, B, C와 두 연산기호가 모두 포함되어 표시되어야 함 (62 + 3 − 10 = 55)', () => {
    const html = renderToString(<ResultPage />);

    // 1번 문항 (세 수 연산): 62 + 3 − 10 = 55
    expect(html).toContain('62');
    expect(html).toContain('+');
    expect(html).toContain('3');
    expect(html).toContain('−');
    expect(html).toContain('10');
    expect(html).toContain('55');

    // 62 + 3 = 55 와 같이 C(10) 및 연산기호2(−)가 누락되지 않았는지 검증 (renderToString 주석 허용)
    expect(html).toMatch(/62(?:<!-- -->|\s)*\+(?:<!-- -->|\s)*3(?:<!-- -->|\s)*−(?:<!-- -->|\s)*10(?:<!-- -->|\s)*=/);
  });

  it('두 수의 연산 문제는 기존대로 A op B = ans 형식으로 올바르게 표시되어야 함 (15 + 7 = 22)', () => {
    const html = renderToString(<ResultPage />);

    // 2번 문항 (두 수 연산): 15 + 7 = 22
    expect(html).toMatch(/15(?:<!-- -->|\s)*\+(?:<!-- -->|\s)*7(?:<!-- -->|\s)*=/);
  });
});
