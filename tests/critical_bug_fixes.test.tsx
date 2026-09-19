import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { UniversalProblem } from '../src/components/problem-view/UniversalProblem';
import { FractionProblem } from '../src/components/problem-view/FractionProblem';
import { Problem, WorksheetRule } from '../src/domain/math/types';
import { generateDivisionProblem } from '../src/domain/math/generators/division';
import { generateDecimalProblem } from '../src/domain/math/generators/decimalGenerator';
import { generateThreeOperandProblem } from '../src/domain/math/generators/threeOperandsGenerator';
import { generateFactorProblem } from '../src/domain/math/generators/factorGenerator';
import { evaluateProblemAnswer } from '../src/stores/worksheetStore';

describe('핵심 잠재 버그(Critical Bugs) 전수 방어 검증 테스트', () => {
  describe('Bug 1: 분수 정수형 결과 0/1 표기 방지 및 채점 정합성', () => {
    it('분수 연산 결과가 2 (whole: 2, numerator: 0)일 때 화면에 0/1 없이 2만 렌더링되어야 함', () => {
      const prob: Problem = {
        id: 'frac_int_1',
        index: 1,
        operation: 'addition',
        category: 'fraction',
        operandA: 0,
        operandB: 0,
        answer: 2,
        fractionA: { whole: 1, numerator: 1, denominator: 2 },
        fractionB: { numerator: 1, denominator: 2 },
        fractionAnswer: { whole: 2, numerator: 0, denominator: 1 },
      };

      const html = renderToString(
        <FractionProblem problem={prob} showAnswer={true} />
      );

      // 답안 영역에 '2'는 표시되어야 하고 '0/1'이나 분수 스택(my-[1px])이 없어야 함
      const answerPart = html.substring(html.indexOf('bg-emerald-50/80'));
      expect(answerPart).toContain('2');
      expect(answerPart).not.toContain('0/1');
      expect(answerPart).not.toContain('my-[1px]');
    });

    it('분수 연산 결과가 0일 때 화면에 0/1 대신 0만 렌더링되어야 함', () => {
      const prob: Problem = {
        id: 'frac_zero_1',
        index: 1,
        operation: 'subtraction',
        category: 'fraction',
        operandA: 0,
        operandB: 0,
        answer: 0,
        fractionA: { numerator: 1, denominator: 2 },
        fractionB: { numerator: 1, denominator: 2 },
        fractionAnswer: { whole: undefined, numerator: 0, denominator: 1 },
      };

      const html = renderToString(
        <FractionProblem problem={prob} showAnswer={true} />
      );

      const answerPart = html.substring(html.indexOf('bg-emerald-50/80'));
      expect(answerPart).toContain('0');
      expect(answerPart).not.toContain('0/1');
      expect(answerPart).not.toContain('my-[1px]');
    });

    it('온라인 채점에서 정수 답에 대해 학생이 자연수({ whole: 2 })만 입력해도 정답이어야 함', () => {
      const prob: Problem = {
        id: 'frac_ans_test',
        index: 1,
        operation: 'addition',
        category: 'fraction',
        operandA: 0,
        operandB: 0,
        answer: 2,
        fractionA: { numerator: 4, denominator: 4 },
        fractionB: { numerator: 4, denominator: 4 },
        fractionAnswer: { whole: 2, numerator: 0, denominator: 1 },
      };

      const userAns = {
        problemId: 'frac_ans_test',
        fractionAnswer: { whole: 2 },
      };

      expect(evaluateProblemAnswer(prob, userAns)).toBe(true);
    });
  });

  describe('Bug 2: 나눗셈 및 소수 나눗셈 세로셈 설정 시 가로셈 강제 및 여백/입력창 무결점', () => {
    it('세로셈(vertical) 규칙이어도 자연수 나눗셈은 항상 가로셈(horizontal)으로 생성되어야 함', () => {
      const rule: WorksheetRule = {
        schemaVersion: 1,
        title: '나눗셈 가로셈 강제 검증',
        operations: ['division'],
        count: 10,
        operandA: { digits: [2] },
        operandB: { digits: [1] },
        carryCondition: 'none',
        borrowCondition: 'none',
        divisionCondition: 'required',
        allowNegative: false,
        allowZero: false,
        uniqueMode: 'exact',
        displayFormat: 'vertical', // 의도적 세로셈 설정
        showFirstExample: true,
      };

      for (let i = 1; i <= 10; i++) {
        const prob = generateDivisionProblem(rule, i);
        expect(prob).not.toBeNull();
        expect(prob!.displayFormat).toBe('horizontal');
      }
    });

    it('소수 나눗셈도 세로셈 규칙이어도 항상 가로셈(horizontal)으로 생성되어야 함', () => {
      const rule: WorksheetRule = {
        schemaVersion: 1,
        title: '소수 나눗셈 가로셈 강제 검증',
        operations: ['division'],
        category: 'decimal',
        count: 10,
        operandA: { digits: [1] },
        operandB: { digits: [1] },
        carryCondition: 'none',
        borrowCondition: 'none',
        divisionCondition: 'none',
        allowNegative: false,
        allowZero: false,
        uniqueMode: 'exact',
        displayFormat: 'vertical', // 세로셈 설정
        showFirstExample: true,
        decimalRule: { decimalPlacesA: [1], decimalPlacesB: [1], isDivisionWithRemainder: true },
      };

      for (let i = 1; i <= 10; i++) {
        const prob = generateDecimalProblem(rule, i);
        expect(prob).not.toBeNull();
        expect(prob!.displayFormat).toBe('horizontal');
      }
    });

    it('UniversalProblem에 displayFormat: "vertical"인 나눗셈 문제가 전달되어도 HorizontalProblem으로 안전하게 렌더링되어야 함', () => {
      const prob: Problem = {
        id: 'div_safety_1',
        index: 1,
        operation: 'division',
        operandA: 25,
        operandB: 4,
        answer: 6,
        remainder: 1,
        displayFormat: 'vertical', // 비정상적으로 vertical이 주입된 경우
      };

      const html = renderToString(
        <UniversalProblem problem={prob} />
      );

      // 가로셈의 등호(=)와 몫, 나머지 placeholder가 존재해야 함
      expect(html).toContain('=');
      expect(html).toContain('placeholder="몫"');
      expect(html).toContain('placeholder="나머지"');
    });
  });

  describe('Bug 3: 인쇄 모드 분수 답안 박스 형태 유출 방지', () => {
    it('인쇄 모드(isReadOnly)에서 진분수 문제도 자연수 가이드 박스를 표준 제공하여 정답 형태가 미리 유출되지 않아야 함', () => {
      const properFracProb: Problem = {
        id: 'proper_frac',
        index: 1,
        operation: 'addition',
        category: 'fraction',
        operandA: 0,
        operandB: 0,
        answer: 0,
        fractionA: { numerator: 1, denominator: 5 },
        fractionB: { numerator: 2, denominator: 5 },
        fractionAnswer: { numerator: 3, denominator: 5 }, // 진분수 정답 (whole 없음)
      };

      const html = renderToString(
        <FractionProblem problem={properFracProb} isReadOnly={true} />
      );

      // 분수선이 존재하고 자연수 박스 및 분자/분모 박스가 포함되어야 함
      expect(html).toContain('bg-slate-400');
    });

    it('인쇄 모드(isReadOnly)에서 자연수로 떨어지는 분수 문제는 분수선 없이 단일 박스만 제공되어야 함', () => {
      const wholeFracProb: Problem = {
        id: 'whole_frac',
        index: 1,
        operation: 'addition',
        category: 'fraction',
        operandA: 0,
        operandB: 0,
        answer: 1,
        fractionA: { numerator: 2, denominator: 5 },
        fractionB: { numerator: 3, denominator: 5 },
        fractionAnswer: { whole: 1, numerator: 0, denominator: 1 }, // 정수 1 정답
      };

      const html = renderToString(
        <FractionProblem problem={wholeFracProb} isReadOnly={true} />
      );

      // 분수선(bg-slate-400)이 없어야 함
      expect(html).not.toContain('bg-slate-400');
    });
  });

  describe('Bug 4: 세 수의 연산 우선순위 모호성 방지', () => {
    it('곱셈이 포함된 세 수의 연산(A + B × C 등)은 세로셈 설정이어도 반드시 가로셈(horizontal)이어야 함', () => {
      const rule: WorksheetRule = {
        schemaVersion: 1,
        title: '세 수의 곱셈 혼합',
        operations: ['addition', 'multiplication'],
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
        displayFormat: 'vertical',
        showFirstExample: true,
      };

      for (let i = 1; i <= 20; i++) {
        const prob = generateThreeOperandProblem(rule, i);
        if (prob) {
          if (prob.operation === 'multiplication' || prob.operation2 === 'multiplication') {
            expect(prob.displayFormat).toBe('horizontal');
          }
        }
      }
    });
  });

  describe('Bug 5: 최대공약수/최소공배수 및 비례식 경계값 방어', () => {
    it('maxNumber가 작은 경우에도 factorGenerator가 오류 없이 정상 생성되어야 함', () => {
      const rule: WorksheetRule = {
        schemaVersion: 1,
        title: '약수와 배수 작은 범위',
        operations: ['division'],
        category: 'factors_multiples',
        count: 10,
        operandA: { digits: [1] },
        operandB: { digits: [1] },
        carryCondition: 'none',
        borrowCondition: 'none',
        divisionCondition: 'none',
        allowNegative: false,
        allowZero: false,
        uniqueMode: 'exact',
        displayFormat: 'horizontal',
        showFirstExample: true,
        factorRule: { type: 'gcd', maxNumber: 20 },
      };

      for (let i = 1; i <= 10; i++) {
        const prob = generateFactorProblem(rule, i);
        expect(prob).not.toBeNull();
        expect(prob!.operandA).toBeGreaterThanOrEqual(1);
        expect(prob!.operandB).toBeGreaterThanOrEqual(1);
        expect(prob!.operandA).not.toBe(prob!.operandB);
      }
    });
  });
});
