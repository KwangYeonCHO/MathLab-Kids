import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GRADE_PRESETS } from '../src/domain/math/presets';
import { WorksheetRule } from '../src/domain/math/types';
import { generateAdditionProblem } from '../src/domain/math/generators/addition';
import { generateSubtractionProblem } from '../src/domain/math/generators/subtraction';
import { generateMultiplicationProblem } from '../src/domain/math/generators/multiplication';
import { generateDivisionProblem } from '../src/domain/math/generators/division';
import { generateThreeOperandProblem } from '../src/domain/math/generators/threeOperandsGenerator';
import { generateWorksheet } from '../src/domain/math/generators/engine';
import { matchesPreset } from '../src/domain/math/ruleTitle';

const base: WorksheetRule = {
  ...GRADE_PRESETS[0].rule,
  operations: ['addition'], carryCondition: 'any', borrowCondition: 'any',
  operandA: { digits: [1, 2], min: 9, max: 20 },
  operandB: { digits: [1], min: 2, max: 4 },
};

/** 고정 시드로 경계값과 여러 자릿수를 반복 검증하여 범위를 벗어나는 출제를 탐지합니다. */
describe('위치별 피연산자 범위', () => {
  beforeEach(() => {
    let seed = 12345;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 2 ** 32;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ['addition', generateAdditionProblem], ['subtraction', generateSubtractionProblem],
    ['multiplication', generateMultiplicationProblem], ['division', generateDivisionProblem],
  ] as const)('%s의 각 피연산자가 지정 범위를 벗어나지 않는다', (operation, generate) => {
    for (let i = 0; i < 200; i++) {
      const problem = generate({ ...base, operations: [operation] }, i + 1);
      expect(problem).not.toBeNull();
      expect(problem!.operandA).toBeGreaterThanOrEqual(9);
      expect(problem!.operandA).toBeLessThanOrEqual(20);
      expect(problem!.operandB).toBeGreaterThanOrEqual(2);
      expect(problem!.operandB).toBeLessThanOrEqual(4);
    }
  });

  it('9와 20을 모두 포함하고 범위와 교집합이 없는 자릿수는 제외한다', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 300; i++) {
      const p = generateAdditionProblem({ ...base, operandA: { ...base.operandA, digits: [1, 2, 3, 4] } }, i)!;
      expect(p).not.toBeNull();
      seen.add(p.operandA);
      expect(p.operandA).toBeGreaterThanOrEqual(9);
      expect(p.operandA).toBeLessThanOrEqual(20);
    }
    expect(seen.has(9)).toBe(true);
    expect(seen.has(20)).toBe(true);
  });

  it('피연산자가 20으로 고정되어도 정답 40은 허용한다', () => {
    const fixed = { digits: [2], min: 20, max: 20 };
    const result = generateWorksheet({ ...base, count: 1, operandA: fixed, operandB: fixed });
    expect(result.success).toBe(true);
    expect(result.problems[0]).toMatchObject({ operandA: 20, operandB: 20, answer: 40 });
  });

  it('좁은 범위의 받아올림 없음 조건을 자릿수 전체 재추출 없이 만족한다', () => {
    const p = generateAdditionProblem({ ...base, carryCondition: 'none',
      operandA: { digits: [4], min: 1111, max: 1111 },
      operandB: { digits: [4], min: 2222, max: 2222 },
    }, 1);
    expect(p).toMatchObject({ operandA: 1111, operandB: 2222, answer: 3333 });
  });

  it('세 수의 연산에서도 A, B, C 범위를 독립적으로 준수한다', () => {
    for (let i = 0; i < 200; i++) {
      const p = generateThreeOperandProblem({ ...base, operandCount: 3,
        operandC: { digits: [1], min: 5, max: 8 },
      }, i)!;
      expect(p).not.toBeNull();
      expect(p.operandA).toBeGreaterThanOrEqual(9);
      expect(p.operandA).toBeLessThanOrEqual(20);
      expect(p.operandB).toBeGreaterThanOrEqual(2);
      expect(p.operandB).toBeLessThanOrEqual(4);
      expect(p.operandC).toBeGreaterThanOrEqual(5);
      expect(p.operandC).toBeLessThanOrEqual(8);
      expect(p.answer).toBe(p.operandA + p.operandB + p.operandC!);
    }
  });

  it('곱셈구구 분기에서도 A와 B의 범위를 준수한다', () => {
    for (let i = 0; i < 100; i++) {
      const p = generateMultiplicationProblem({ ...base,
        operandA: { digits: [1], min: 7, max: 9 },
        operandB: { digits: [1], min: 3, max: 5 },
      }, i)!;
      expect(p).not.toBeNull();
      expect(p.operandA).toBeGreaterThanOrEqual(7);
      expect(p.operandA).toBeLessThanOrEqual(9);
      expect(p.operandB).toBeGreaterThanOrEqual(3);
      expect(p.operandB).toBeLessThanOrEqual(5);
    }
  });

  it('역전된 범위와 자릿수 밖 범위는 잘못된 수를 생성하지 않는다', () => {
    expect(generateAdditionProblem({ ...base, operandA: { digits: [1], min: 20, max: 9 } }, 1)).toBeNull();
    expect(generateThreeOperandProblem({ ...base, operandC: { digits: [1], min: 30, max: 40 } }, 1)).toBeNull();
  });

  it('범위를 수정한 규칙은 원래 프리셋으로 선택되지 않는다', () => {
    const preset = GRADE_PRESETS[0].rule;
    expect(matchesPreset({ ...preset, operandA: { ...preset.operandA, min: 3, max: 7 } }, preset)).toBe(false);
  });
});
