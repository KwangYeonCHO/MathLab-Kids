/**
 * MathLab Kids - 세 수의 사칙연산 문제 생성기 (Three Operands Generator)
 * 대한민국 2022 개정 초등 수학 교육과정 기준:
 * - 세 수의 덧셈 (A + B + C)
 * - 세 수의 뺄셈 (A - B - C)
 * - 세 수의 덧셈과 뺄셈 혼합 (A + B - C, A - B + C)
 * - 세 수의 곱셈 (A × B × C)
 * - 세 수의 나눗셈 (A ÷ B ÷ C) 및 곱셈·나눗셈 혼합
 * - 중간 연산값 및 최종 결과가 음수가 되지 않도록 전수 보장 (교육과정 무결점 원칙)
 * - 나눗셈 시 각 단계가 자연수로 나누어떨어짐을 전수 보장
 */
import { WorksheetRule, Problem, Operation } from '../types';
import { getRandomInt, pickRandom, getRangeForDigit } from './utils';
import { countCarries } from '../analyzers/carry';

export function generateThreeOperandProblem(
  rule: WorksheetRule,
  index: number,
  isExample: boolean = false
): Problem | null {
  const operations = rule.operations && rule.operations.length > 0
    ? rule.operations
    : ['addition' as Operation];

  const digitA = pickRandom(rule.operandA.digits);
  const digitB = pickRandom(rule.operandB.digits);
  const digitC = pickRandom(rule.operandC?.digits || rule.operandB.digits);

  const rangeA = getRangeForDigit(digitA, rule.allowZero);
  const rangeB = getRangeForDigit(digitB, rule.allowZero);
  const rangeC = getRangeForDigit(digitC, rule.allowZero);

  const minA = Math.max(rangeA.min, rule.operandA.min ?? rangeA.min);
  const maxA = Math.min(rangeA.max, rule.operandA.max ?? rangeA.max);
  const minB = Math.max(rangeB.min, rule.operandB.min ?? rangeB.min);
  const maxB = Math.min(rangeB.max, rule.operandB.max ?? rangeB.max);
  const minC = Math.max(rangeC.min, rule.operandC?.min ?? rangeC.min);
  const maxC = Math.min(rangeC.max, rule.operandC?.max ?? rangeC.max);

  // 최대 300회 시도하여 초등 교육과정에 100% 부합하는 세 수의 연산식 생성
  for (let attempt = 0; attempt < 300; attempt++) {
    const op1 = pickRandom(operations);
    const op2 = pickRandom(operations);

    let a: number;
    let b: number;
    let c: number;
    let answer: number;

    // 1. 세 수의 덧셈 전용 (A + B + C)
    if (op1 === 'addition' && op2 === 'addition') {
      a = getRandomInt(minA, maxA);
      b = getRandomInt(minB, maxB);
      c = getRandomInt(minC, maxC);

      const carries1 = countCarries(a, b);
      const carries2 = countCarries(a + b, c);
      const totalCarries = carries1 + carries2;

      if (rule.carryCondition === 'none' && totalCarries > 0) continue;
      if (rule.carryCondition === 'once' && totalCarries !== 1) continue;
      if (rule.carryCondition === 'twice' && totalCarries !== 2) continue;
      if (rule.carryCondition === 'more' && totalCarries < 3) continue;

      answer = a + b + c;
    }
    // 2. 세 수의 뺄셈 전용 (A - B - C)
    else if (op1 === 'subtraction' && op2 === 'subtraction') {
      b = getRandomInt(minB, maxB);
      c = getRandomInt(minC, maxC);
      // a >= b + c 이어야 중간 연산(a - b) 및 최종 연산(a - b - c) 모두 음수가 안 됨
      const minSum = b + c;
      if (minSum > maxA) continue;
      a = getRandomInt(Math.max(minA, minSum), maxA);

      const step1 = a - b;
      if (step1 < c) continue;
      answer = step1 - c;
    }
    // 3. 덧셈 후 뺄셈 (A + B - C)
    else if (op1 === 'addition' && op2 === 'subtraction') {
      a = getRandomInt(minA, maxA);
      b = getRandomInt(minB, maxB);
      const sum = a + b;
      if (sum < minC) continue;
      c = getRandomInt(minC, Math.min(maxC, sum));
      answer = sum - c;
    }
    // 4. 뺄셈 후 덧셈 (A - B + C)
    else if (op1 === 'subtraction' && op2 === 'addition') {
      b = getRandomInt(minB, maxB);
      if (b > maxA) continue;
      a = getRandomInt(Math.max(minA, b), maxA);
      c = getRandomInt(minC, maxC);
      const step1 = a - b;
      answer = step1 + c;
    }
    // 5. 세 수의 곱셈 전용 (A × B × C)
    else if (op1 === 'multiplication' && op2 === 'multiplication') {
      a = getRandomInt(minA, maxA);
      b = getRandomInt(minB, maxB);
      c = getRandomInt(minC, maxC);
      answer = a * b * c;
    }
    // 6. 세 수의 나눗셈 전용 (A ÷ B ÷ C)
    else if (op1 === 'division' && op2 === 'division') {
      b = getRandomInt(Math.max(1, minB), maxB);
      c = getRandomInt(Math.max(1, minC), maxC);
      const quotient = getRandomInt(1, Math.max(1, Math.floor(maxA / (b * c))));
      a = b * c * quotient;
      if (a < minA || a > maxA) continue;
      answer = quotient;
    }
    // 7. 곱셈 후 나눗셈 (A × B ÷ C)
    else if (op1 === 'multiplication' && op2 === 'division') {
      c = getRandomInt(Math.max(1, minC), maxC);
      const quotient = getRandomInt(1, 20);
      const product = c * quotient;
      // product = a * b
      const factors: Array<[number, number]> = [];
      for (let candA = minA; candA <= maxA; candA++) {
        if (candA === 0) continue;
        if (product % candA === 0) {
          const candB = product / candA;
          if (candB >= minB && candB <= maxB) {
            factors.push([candA, candB]);
          }
        }
      }
      if (factors.length === 0) continue;
      const [chosenA, chosenB] = pickRandom(factors);
      a = chosenA;
      b = chosenB;
      answer = quotient;
    }
    // 8. 나눗셈 후 곱셈 (A ÷ B × C)
    else if (op1 === 'division' && op2 === 'multiplication') {
      b = getRandomInt(Math.max(1, minB), maxB);
      const quotient = getRandomInt(1, Math.max(1, Math.floor(maxA / b)));
      a = b * quotient;
      if (a < minA || a > maxA) continue;
      c = getRandomInt(minC, maxC);
      answer = quotient * c;
    }
    // 9. 곱셈/나눗셈과 덧셈/뺄셈 사칙 혼합 (표준 연산자 우선순위 적용)
    else {
      // op1: +/-, op2: ×/÷ -> op2 우선 계산
      if ((op1 === 'addition' || op1 === 'subtraction') && (op2 === 'multiplication' || op2 === 'division')) {
        b = getRandomInt(minB, maxB);
        c = getRandomInt(minC, maxC);
        let step2: number;
        if (op2 === 'multiplication') {
          step2 = b * c;
        } else {
          if (c === 0 || b % c !== 0) continue;
          step2 = b / c;
        }

        if (op1 === 'subtraction') {
          if (step2 > maxA) continue;
          a = getRandomInt(Math.max(minA, step2), maxA);
          answer = a - step2;
        } else {
          a = getRandomInt(minA, maxA);
          answer = a + step2;
        }
      }
      // op1: ×/÷, op2: +/- -> op1 우선 계산
      else {
        a = getRandomInt(minA, maxA);
        b = getRandomInt(minB, maxB);
        c = getRandomInt(minC, maxC);
        let step1: number;
        if (op1 === 'multiplication') {
          step1 = a * b;
        } else {
          if (b === 0 || a % b !== 0) continue;
          step1 = a / b;
        }

        if (op2 === 'subtraction') {
          if (step1 < c) continue;
          answer = step1 - c;
        } else {
          answer = step1 + c;
        }
      }
    }

    // 기본 검증
    if (a === undefined || b === undefined || c === undefined || answer === undefined) continue;
    if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(answer)) continue;

    // 음수 방지 (초등 교육과정 철칙)
    if (!rule.allowNegative && answer < 0) continue;

    // 0 허용 여부 검증
    if (!rule.allowZero && (a === 0 || b === 0 || c === 0)) continue;

    // 결과값 범위 검증
    if (rule.resultMin !== undefined && answer < rule.resultMin) continue;
    if (rule.resultMax !== undefined && answer > rule.resultMax) continue;

    // 일의 자리 0 끝자리 검증
    if (rule.operandA.allowZeroEnding === false && a % 10 === 0) continue;
    if (rule.operandB.allowZeroEnding === false && b % 10 === 0) continue;
    if (rule.operandC?.allowZeroEnding === false && c % 10 === 0) continue;

    // 세로셈 형식 결정: 세 수의 덧셈(+ +)인 경우에만 3단 세로셈 지원, 그 외는 가로셈으로 렌더링
    const displayFormat =
      rule.displayFormat === 'vertical' && op1 === 'addition' && op2 === 'addition'
        ? 'vertical'
        : 'horizontal';

    return {
      id: `three-${index}-${op1}-${op2}-${a}-${b}-${c}`,
      index,
      operation: op1,
      operation2: op2,
      operandA: a,
      operandB: b,
      operandC: c,
      answer,
      isExample,
      displayFormat,
    };
  }

  return null;
}
