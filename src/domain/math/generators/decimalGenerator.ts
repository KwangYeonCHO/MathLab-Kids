/**
 * MathLab Kids - 소수 문제 생성기 (Decimal Generator)
 * 대한민국 2022 개정 초등 5~6학년 기준:
 * - 소수의 덧셈과 뺄셈 (자릿수 맞춤)
 * - 소수의 곱셈 (소수점 이동)
 * - 소수의 나눗셈 (몫 구하기 및 몫과 소수 나머지)
 */
import { Problem, WorksheetRule } from '../types';
import {
  addDecimals,
  subDecimals,
  multiplyDecimals,
  divideDecimals,
  divideDecimalsWithRemainder,
} from '../core/decimal';
import { getRandomInt } from './utils';

export function generateDecimalProblem(
  rule: WorksheetRule,
  index: number,
  isExample: boolean = false
): Problem | null {
  const decRule = rule.decimalRule || {
    decimalPlacesA: [1],
    decimalPlacesB: [1],
    isDivisionWithRemainder: false,
  };

  const placesA = decRule.decimalPlacesA[getRandomInt(0, decRule.decimalPlacesA.length - 1)] || 1;
  const placesB = decRule.decimalPlacesB[getRandomInt(0, decRule.decimalPlacesB.length - 1)] || 1;

  const factorA = Math.pow(10, placesA);
  const factorB = Math.pow(10, placesB);

  // 피연산자 정수부 및 소수부 생성
  // 예: 1자리 소수 -> 1~99 / 10 = 0.1 ~ 9.9
  const rawIntA = getRandomInt(1, Math.min(999, factorA * 20));
  const rawIntB = getRandomInt(1, Math.min(99, factorB * 10));

  let opA = rawIntA / factorA;
  let opB = rawIntB / factorB;

  const operation = rule.operations[0] || 'multiplication';
  let answer = 0;
  let remainder: number | undefined = undefined;

  try {
    switch (operation) {
      case 'addition':
        answer = addDecimals(opA, opB);
        break;

      case 'subtraction':
        if (opA < opB) {
          const temp = opA;
          opA = opB;
          opB = temp;
        }
        answer = subDecimals(opA, opB);
        break;

      case 'multiplication':
        answer = multiplyDecimals(opA, opB);
        break;

      case 'division':
        if (decRule.isDivisionWithRemainder) {
          // 몫과 소수 나머지 구하기
          const res = divideDecimalsWithRemainder(opA, opB);
          answer = res.quotient;
          remainder = res.remainder;
        } else {
          // 딱 나누어떨어지는 소수 나눗셈 문제 생성: (몫 * 제수 = 피제수) 역생성 기법
          const quotient = getRandomInt(1, 30);
          opA = multiplyDecimals(opB, quotient);
          answer = quotient;
        }
        break;

      default:
        answer = multiplyDecimals(opA, opB);
        break;
    }
  } catch {
    return null;
  }

  return {
    id: `dec_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    index,
    operation,
    category: 'decimal',
    operandA: opA,
    operandB: opB,
    answer,
    remainder,
    isExample,
    displayFormat: rule.displayFormat === 'vertical' ? 'vertical' : 'horizontal',
  };
}
