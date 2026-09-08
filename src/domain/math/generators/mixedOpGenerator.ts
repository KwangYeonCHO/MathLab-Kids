/**
 * MathLab Kids - 자연수 혼합 계산 문제 생성기 (Mixed Operation Generator)
 * 대한민국 2022 개정 초등 5학년 1학기 기준:
 * - 사칙연산과 괄호 ( )가 포함된 복합 연산식 생성
 * - 모든 중간/최종 계산이 음수 없는 자연수이고 나눗셈이 나누어떨어짐을 전수 검증
 */
import { Problem, WorksheetRule } from '../types';
import { evaluateMixedExpression } from '../core/mixedOperation';
import { getRandomInt } from './utils';

export function generateMixedOpProblem(
  rule: WorksheetRule,
  index: number,
  isExample: boolean = false
): Problem | null {
  const mRule = rule.mixedOpRule || {
    hasParentheses: false,
    opCount: 2,
  };

  const hasParen = mRule.hasParentheses;

  // 최대 50회 시도하여 초등 교육과정에 100% 부합하는 수식 생성
  for (let attempt = 0; attempt < 50; attempt++) {
    let expr = '';

    if (!hasParen) {
      // 괄호 없는 2개 또는 3개 연산자 식
      const pattern = getRandomInt(1, 4);
      switch (pattern) {
        case 1: {
          // A + B * C
          const b = getRandomInt(2, 9);
          const c = getRandomInt(2, 9);
          const a = getRandomInt(5, 50);
          expr = `${a} + ${b} × ${c}`;
          break;
        }
        case 2: {
          // A - B * C
          const b = getRandomInt(2, 9);
          const c = getRandomInt(2, 9);
          const a = b * c + getRandomInt(5, 40);
          expr = `${a} − ${b} × ${c}`;
          break;
        }
        case 3: {
          // A + B / C
          const c = getRandomInt(2, 9);
          const quotient = getRandomInt(2, 9);
          const b = c * quotient;
          const a = getRandomInt(5, 50);
          expr = `${a} + ${b} ÷ ${c}`;
          break;
        }
        case 4: {
          // A - B / C + D
          const c = getRandomInt(2, 9);
          const quotient = getRandomInt(2, 9);
          const b = c * quotient;
          const a = quotient + getRandomInt(5, 30);
          const d = getRandomInt(2, 20);
          expr = `${a} − ${b} ÷ ${c} + ${d}`;
          break;
        }
      }
    } else {
      // 괄호 ( )가 유의미하게 포함된 식
      const pattern = getRandomInt(1, 4);
      switch (pattern) {
        case 1: {
          // (A + B) * C
          const a = getRandomInt(2, 15);
          const b = getRandomInt(2, 15);
          const c = getRandomInt(2, 6);
          expr = `(${a} + ${b}) × ${c}`;
          break;
        }
        case 2: {
          // (A - B) * C
          const diff = getRandomInt(2, 10);
          const b = getRandomInt(3, 20);
          const a = b + diff;
          const c = getRandomInt(2, 6);
          expr = `(${a} − ${b}) × ${c}`;
          break;
        }
        case 3: {
          // (A + B) / C
          const c = getRandomInt(2, 8);
          const quotient = getRandomInt(2, 9);
          const sum = c * quotient;
          const a = getRandomInt(1, sum - 1);
          const b = sum - a;
          expr = `(${a} + ${b}) ÷ ${c}`;
          break;
        }
        case 4: {
          // A - (B + C * D)
          const c = getRandomInt(2, 6);
          const d = getRandomInt(2, 6);
          const b = getRandomInt(2, 15);
          const inside = b + c * d;
          const a = inside + getRandomInt(5, 30);
          expr = `${a} − (${b} + ${c} × ${d})`;
          break;
        }
      }
    }

    const evalResult = evaluateMixedExpression(expr);
    if (evalResult.isValidElementary && evalResult.answer > 0) {
      return {
        id: `mix_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        index,
        operation: 'addition',
        category: 'mixed_operation',
        operandA: 0,
        operandB: 0,
        answer: evalResult.answer,
        expression: expr,
        isExample,
        displayFormat: 'horizontal',
      };
    }
  }

  return null;
}
