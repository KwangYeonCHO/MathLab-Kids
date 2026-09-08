import { describe, it, expect } from 'vitest';
import { generateWorksheet } from '../src/domain/math/generators/engine';
import { WorksheetRule } from '../src/domain/math/types';
import { evaluateMixedExpression } from '../src/domain/math/core/mixedOperation';

describe('초등 5~6학년 생성기 퍼징(Fuzz Testing) 무결점 검증', () => {
  it('분수 덧셈/뺄셈 200문제를 연속 생성하여 수학적 정합성을 검증해야 함', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '분수 덧셈 뺄셈',
      operations: ['addition'],
      category: 'fraction',
      count: 20,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
      fractionRule: {
        type: 'addition',
        allowMixed: true,
        sameDenominator: false,
        maxDenominator: 12,
      },
    };

    for (let loop = 0; loop < 10; loop++) {
      const result = generateWorksheet(rule);
      expect(result.success).toBe(true);
      expect(result.problems.length).toBe(20);

      result.problems.forEach((p) => {
        expect(p.category).toBe('fraction');
        expect(p.fractionA).toBeDefined();
        expect(p.fractionB).toBeDefined();
        expect(p.fractionAnswer).toBeDefined();
        expect(p.fractionA!.denominator).toBeGreaterThan(0);
        expect(p.fractionB!.denominator).toBeGreaterThan(0);
        expect(p.fractionAnswer!.denominator).toBeGreaterThan(0);
        expect(isNaN(p.fractionAnswer!.numerator)).toBe(false);
      });
    }
  });

  it('소수 곱셈 200문제를 연속 생성하여 부동소수점 오차 및 NaN이 없음을 검증해야 함', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '소수 곱셈',
      operations: ['multiplication'],
      category: 'decimal',
      count: 20,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
      decimalRule: {
        decimalPlacesA: [1],
        decimalPlacesB: [1],
      },
    };

    for (let loop = 0; loop < 10; loop++) {
      const result = generateWorksheet(rule);
      expect(result.success).toBe(true);
      expect(result.problems.length).toBe(20);

      result.problems.forEach((p) => {
        expect(p.category).toBe('decimal');
        expect(isNaN(p.operandA)).toBe(false);
        expect(isNaN(p.operandB)).toBe(false);
        expect(isNaN(p.answer)).toBe(false);
        expect(p.answer).toBeGreaterThan(0);
      });
    }
  });

  it('자연수 혼합계산 200문제를 연속 생성하여 초등 교육과정(음수 없음, 정수 나눗셈)을 100% 준수함을 검증해야 함', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '혼합계산 테스트',
      operations: ['addition'],
      category: 'mixed_operation',
      count: 20,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
      mixedOpRule: {
        hasParentheses: true,
        opCount: 2,
      },
    };

    for (let loop = 0; loop < 10; loop++) {
      const result = generateWorksheet(rule);
      expect(result.success).toBe(true);
      expect(result.problems.length).toBe(20);

      result.problems.forEach((p) => {
        expect(p.category).toBe('mixed_operation');
        expect(p.expression).toBeDefined();

        // 수식 재검증
        const evalRes = evaluateMixedExpression(p.expression!);
        expect(evalRes.isValidElementary).toBe(true);
        expect(evalRes.answer).toBe(p.answer);
        expect(evalRes.answer).toBeGreaterThan(0);
      });
    }
  });

  it('비례식 미지항 200문제를 연속 생성하여 외항의 곱 = 내항의 곱 성질을 100% 만족해야 함', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '비례식 테스트',
      operations: ['multiplication'],
      category: 'proportion',
      count: 20,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
      proportionRule: {
        type: 'solve_proportion',
      },
    };

    for (let loop = 0; loop < 10; loop++) {
      const result = generateWorksheet(rule);
      expect(result.success).toBe(true);
      expect(result.problems.length).toBe(20);

      result.problems.forEach((p) => {
        expect(p.category).toBe('proportion');
        expect(p.proportion).toBeDefined();
        const prop = p.proportion!;

        const a = prop.a ?? p.answer;
        const b = prop.b ?? p.answer;
        const c = prop.c ?? p.answer;
        const d = prop.d ?? p.answer;

        // 외항의 곱 == 내항의 곱
        expect(Math.round(a * d)).toBe(Math.round(b * c));
      });
    }
  });

  it('최대공약수/최소공배수 문제를 연속 생성하여 답의 정합성을 검증해야 함', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '최대공약수 테스트',
      operations: ['division'],
      category: 'factors_multiples',
      count: 20,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
      factorRule: {
        type: 'gcd',
        maxNumber: 50,
      },
    };

    const result = generateWorksheet(rule);
    expect(result.success).toBe(true);
    expect(result.problems.length).toBe(20);

    result.problems.forEach((p) => {
      expect(p.category).toBe('factors_multiples');
      expect(p.answer).toBeGreaterThanOrEqual(2);
      expect(p.operandA % p.answer).toBe(0);
      expect(p.operandB % p.answer).toBe(0);
    });
  });
});
