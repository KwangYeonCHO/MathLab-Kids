import { describe, it, expect } from 'vitest';
import { generateWorksheet } from '../src/domain/math/generators/engine';
import { WorksheetRule } from '../src/domain/math/types';
import { GRADE_PRESETS } from '../src/domain/math/presets';
import { resolveRuleTitle } from '../src/domain/math/ruleTitle';
import { makeProblemKey } from '../src/domain/math/generators/utils';

describe('세 수의 사칙연산 연산 엔진 무결점 검증 (Three Operands Engine)', () => {
  it('세 수의 덧셈 (A + B + C) 정답 계산 및 속성 검증', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '세 수의 덧셈',
      operations: ['addition'],
      category: 'arithmetic',
      operandCount: 3,
      count: 20,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      operandC: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
    };

    const result = generateWorksheet(rule);
    expect(result.success).toBe(true);
    expect(result.problems.length).toBe(20);

    result.problems.forEach((p) => {
      expect(p.operandC).toBeDefined();
      expect(p.operation).toBe('addition');
      expect(p.operation2).toBe('addition');
      expect(p.answer).toBe(p.operandA + p.operandB + p.operandC!);
    });
  });

  it('세 수의 뺄셈 (A - B - C) 중간값 및 최종값 음수 방지 검증', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '세 수의 뺄셈',
      operations: ['subtraction'],
      category: 'arithmetic',
      operandCount: 3,
      count: 20,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      operandC: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
    };

    const result = generateWorksheet(rule);
    expect(result.success).toBe(true);

    result.problems.forEach((p) => {
      expect(p.operandC).toBeDefined();
      expect(p.operation).toBe('subtraction');
      expect(p.operation2).toBe('subtraction');
      // 초등 수학 규칙: 중간 뺄셈 결과 >= 0
      expect(p.operandA - p.operandB).toBeGreaterThanOrEqual(0);
      // 최종 결과 >= 0
      expect(p.answer).toBeGreaterThanOrEqual(0);
      expect(p.answer).toBe(p.operandA - p.operandB - p.operandC!);
    });
  });

  it('세 수의 덧셈/뺄셈 혼합 (A + B - C 또는 A - B + C) 정합성 검증', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '세 수의 덧셈과 뺄셈',
      operations: ['addition', 'subtraction'],
      category: 'arithmetic',
      operandCount: 3,
      count: 30,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      operandC: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
    };

    const result = generateWorksheet(rule);
    expect(result.success).toBe(true);

    result.problems.forEach((p) => {
      expect(p.operandC).toBeDefined();
      expect(['addition', 'subtraction']).toContain(p.operation);
      expect(['addition', 'subtraction']).toContain(p.operation2);

      // 단계별 계산 및 음수 방지 검증
      const step1 = p.operation === 'addition' ? p.operandA + p.operandB : p.operandA - p.operandB;
      expect(step1).toBeGreaterThanOrEqual(0);

      const step2 = p.operation2 === 'addition' ? step1 + p.operandC! : step1 - p.operandC!;
      expect(step2).toBeGreaterThanOrEqual(0);
      expect(p.answer).toBe(step2);
    });
  });

  it('세 수의 곱셈 (A × B × C) 정답 계산 검증', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '세 수의 곱셈',
      operations: ['multiplication'],
      category: 'arithmetic',
      operandCount: 3,
      count: 20,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      operandC: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
    };

    const result = generateWorksheet(rule);
    expect(result.success).toBe(true);

    result.problems.forEach((p) => {
      expect(p.operandC).toBeDefined();
      expect(p.operation).toBe('multiplication');
      expect(p.operation2).toBe('multiplication');
      expect(p.answer).toBe(p.operandA * p.operandB * p.operandC!);
    });
  });

  it('세 수의 나눗셈 (A ÷ B ÷ C) 정수 나누어떨어짐 및 0 나누기 방지 검증', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '세 수의 나눗셈',
      operations: ['division'],
      category: 'arithmetic',
      operandCount: 3,
      count: 20,
      operandA: { digits: [2] },
      operandB: { digits: [1] },
      operandC: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
    };

    const result = generateWorksheet(rule);
    expect(result.success).toBe(true);

    result.problems.forEach((p) => {
      expect(p.operandC).toBeDefined();
      expect(p.operandB).toBeGreaterThan(0);
      expect(p.operandC!).toBeGreaterThan(0);
      expect(p.operandA % p.operandB).toBe(0);
      const intermediate = p.operandA / p.operandB;
      expect(intermediate % p.operandC!).toBe(0);
      expect(p.answer).toBe(intermediate / p.operandC!);
    });
  });

  it('세 수의 교환법칙 중복 키(makeProblemKey) 방지 검증', () => {
    // 1 + 2 + 3 과 3 + 1 + 2 는 교환법칙 모드에서 동일한 키 생성
    const key1 = makeProblemKey('addition', 1, 2, 'commutative', undefined, 3, 'addition');
    const key2 = makeProblemKey('addition', 3, 1, 'commutative', undefined, 2, 'addition');
    expect(key1).toBe(key2);

    // 2 * 3 * 4 와 4 * 2 * 3 도 교환법칙 모드에서 동일한 키 생성
    const mulKey1 = makeProblemKey('multiplication', 2, 3, 'commutative', undefined, 4, 'multiplication');
    const mulKey2 = makeProblemKey('multiplication', 4, 2, 'commutative', undefined, 3, 'multiplication');
    expect(mulKey1).toBe(mulKey2);
  });

  it('초1 2학기 공식 프리셋(g1-three-numbers-add-sub) 정상 동작 검증', () => {
    const preset = GRADE_PRESETS.find((p) => p.id === 'g1-three-numbers-add-sub');
    expect(preset).toBeDefined();
    expect(preset?.semesterLabel).toBe('초1(2학기)');
    expect(preset?.rule.operandCount).toBe(3);

    const result = generateWorksheet(preset!.rule);
    expect(result.success).toBe(true);
    expect(result.problems.length).toBe(preset!.rule.count);

    const title = resolveRuleTitle(preset!.rule);
    expect(title).toContain('세 수');
  });

  it('세 수 연산 대규모 퍼징(Fuzz Testing) 500문항 무결점 검증', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '세 수 퍼즈 테스트',
      operations: ['addition', 'subtraction'],
      category: 'arithmetic',
      operandCount: 3,
      count: 50,
      operandA: { digits: [1, 2] },
      operandB: { digits: [1] },
      operandC: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
    };

    for (let loop = 0; loop < 10; loop++) {
      const res = generateWorksheet(rule);
      expect(res.success).toBe(true);
      res.problems.forEach((p) => {
        expect(p.operandC).toBeDefined();
        expect(p.operation2).toBeDefined();
        expect(Number.isFinite(p.answer)).toBe(true);
        expect(isNaN(p.answer)).toBe(false);
        expect(p.answer).toBeGreaterThanOrEqual(0);
      });
    }
  });
});
