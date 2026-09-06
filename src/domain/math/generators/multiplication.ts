/**
 * 곱셈 문제 생성기 (Multiplication Generator)
 * 곱셈구구(2~9단), 여러 자리 수 곱셈, 받아올림 제어, 10/100의 배수 등을 지원합니다.
 */
import { WorksheetRule, Problem } from '../types';
import { getRandomInt, pickRandom, getRangeForDigit } from './utils';

export function generateMultiplicationProblem(
  rule: WorksheetRule,
  index: number,
  isExample: boolean = false
): Problem | null {
  const multRule = rule.multiplicationRule;

  for (let attempt = 0; attempt < 300; attempt++) {
    let a: number;
    let b: number;

    const digitA = pickRandom(rule.operandA.digits);
    const digitB = pickRandom(rule.operandB.digits);

    // 곱셈구구 (한 자리 수 x 한 자리 수 기본)
    if (digitA === 1 && digitB === 1) {
      if (multRule?.specificDans && multRule.specificDans.length > 0) {
        a = pickRandom(multRule.specificDans);
      } else {
        const minDan = multRule?.minDan ?? 2;
        const maxDan = multRule?.maxDan ?? 9;
        a = getRandomInt(minDan, maxDan);
      }

      const minMultiplier = multRule?.includeZeroOne ? 0 : 1;
      b = getRandomInt(minMultiplier, 9);
    } else {
      // 일반 여러 자리 수 곱셈
      const rangeA = getRangeForDigit(digitA, rule.allowZero);
      const rangeB = getRangeForDigit(digitB, rule.allowZero);

      const minA = Math.max(rangeA.min, rule.operandA.min ?? rangeA.min);
      const maxA = Math.min(rangeA.max, rule.operandA.max ?? rangeA.max);
      const minB = Math.max(rangeB.min, rule.operandB.min ?? rangeB.min);
      const maxB = Math.min(rangeB.max, rule.operandB.max ?? rangeB.max);

      a = getRandomInt(minA, maxA);
      b = getRandomInt(minB, maxB);
    }

    // 끝자리 0 검증
    if (rule.operandA.allowZeroEnding === false && a % 10 === 0) continue;
    if (rule.operandB.allowZeroEnding === false && b % 10 === 0) continue;

    // 0 허용 여부
    if (!rule.allowZero && (a === 0 || b === 0)) continue;

    const product = a * b;

    // 받아올림 여부 검증 (두 자리 이상 x 한 자리 등)
    if (multRule?.multiplicationCarry && multRule.multiplicationCarry !== 'any') {
      const hasCarry = checkMultiplicationCarry(a, b);
      if (multRule.multiplicationCarry === 'none' && hasCarry) continue;
      if (multRule.multiplicationCarry === 'required' && !hasCarry) continue;
    }

    if (rule.resultMin !== undefined && product < rule.resultMin) continue;
    if (rule.resultMax !== undefined && product > rule.resultMax) continue;

    const displayFormat = rule.displayFormat === 'mixed'
      ? (Math.random() > 0.5 ? 'horizontal' : 'vertical')
      : rule.displayFormat;

    return {
      id: `mul-${index}-${a}-${b}`,
      index,
      operation: 'multiplication',
      operandA: a,
      operandB: b,
      answer: product,
      isExample,
      displayFormat,
    };
  }

  return null;
}

/** 곱셈 계산 시 자릿수 받아올림 발생 여부 확인 */
function checkMultiplicationCarry(a: number, b: number): boolean {
  // A x B 에서 B가 한 자리 수일 때 각 자릿수와 B의 곱 + 이전 캐리가 10 이상인지 판별
  const multiplier = Math.min(a, b);
  let multiplicand = Math.max(a, b);

  let carry = 0;
  while (multiplicand > 0) {
    const digit = multiplicand % 10;
    const prod = digit * multiplier + carry;
    if (prod >= 10) return true;
    carry = Math.floor(prod / 10);
    multiplicand = Math.floor(multiplicand / 10);
  }
  return false;
}
