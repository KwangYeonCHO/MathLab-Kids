/**
 * MathLab Kids - 분수 문제 생성기 (Fraction Generator)
 * 대한민국 2022 개정 초등 5~6학년 기준:
 * - 동분모 및 이분모 분수의 덧셈과 뺄셈
 * - 대분수 및 진분수의 곱셈과 나눗셈
 * - 기약분수 약분 문제
 */
import { Problem, WorksheetRule } from '../types';
import {
  FractionValue,
  addFractions,
  subFractions,
  multiplyFractions,
  divideFractions,
  simplifyFraction,
  toImproper,
} from '../core/fraction';
import { getRandomInt } from './utils';

export function generateFractionProblem(
  rule: WorksheetRule,
  index: number,
  isExample: boolean = false
): Problem | null {
  const fRule = rule.fractionRule || {
    type: 'addition',
    allowMixed: false,
    sameDenominator: false,
    maxDenominator: 12,
  };

  const maxDenom = fRule.maxDenominator || 12;
  const allowMixed = fRule.allowMixed;

  // 1. 분모 결정 (2 ~ maxDenom)
  let denomA = getRandomInt(2, maxDenom);
  let denomB = fRule.sameDenominator ? denomA : getRandomInt(2, maxDenom);

  // 이분모일 때 가급적 서로 다른 분모 장려 (최대 5회 시도)
  if (!fRule.sameDenominator && denomA === denomB) {
    for (let k = 0; k < 5; k++) {
      denomB = getRandomInt(2, maxDenom);
      if (denomA !== denomB) break;
    }
  }

  // 2. 분자 결정 (진분수: 1 ~ denom-1)
  let numA = getRandomInt(1, denomA - 1);
  let numB = getRandomInt(1, denomB - 1);

  // 3. 대분수 자연수 부분 (1 ~ 3)
  let wholeA: number | undefined = allowMixed && Math.random() > 0.4 ? getRandomInt(1, 3) : undefined;
  let wholeB: number | undefined = allowMixed && Math.random() > 0.4 ? getRandomInt(1, 3) : undefined;

  let fractionA: FractionValue = { whole: wholeA, numerator: numA, denominator: denomA };
  let fractionB: FractionValue = { whole: wholeB, numerator: numB, denominator: denomB };

  let op = fRule.type;
  let fractionAnswer: FractionValue;
  let standardOp: 'addition' | 'subtraction' | 'multiplication' | 'division' = 'addition';

  try {
    switch (op) {
      case 'addition':
        standardOp = 'addition';
        fractionAnswer = addFractions(fractionA, fractionB, true);
        break;

      case 'subtraction': {
        standardOp = 'subtraction';
        // 초등 교육과정상 fractionA >= fractionB 보장
        const impA = toImproper(fractionA);
        const impB = toImproper(fractionB);
        if (impA.numerator * impB.denominator < impB.numerator * impA.denominator) {
          // 순서 교환
          const temp = fractionA;
          fractionA = fractionB;
          fractionB = temp;
        }
        fractionAnswer = subFractions(fractionA, fractionB, true);
        break;
      }

      case 'multiplication':
        standardOp = 'multiplication';
        fractionAnswer = multiplyFractions(fractionA, fractionB, true);
        break;

      case 'division':
        standardOp = 'division';
        fractionAnswer = divideFractions(fractionA, fractionB, true);
        break;

      case 'simplification':
        // 약분 문제: 가분수 또는 기약분수가 아닌 분수
        standardOp = 'addition';
        fractionAnswer = simplifyFraction(fractionA, true);
        break;

      default:
        standardOp = 'addition';
        fractionAnswer = addFractions(fractionA, fractionB, true);
        break;
    }
  } catch {
    return null;
  }

  return {
    id: `frac_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    index,
    operation: standardOp,
    category: 'fraction',
    operandA: fractionA.numerator,
    operandB: fractionB.numerator,
    answer: fractionAnswer.numerator,
    fractionA,
    fractionB,
    fractionAnswer,
    isExample,
    displayFormat: 'horizontal',
  };
}
