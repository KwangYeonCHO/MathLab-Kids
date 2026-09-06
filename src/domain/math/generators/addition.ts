/**
 * 덧셈 문제 생성기 (Addition Generator)
 * 자릿수 조합, 받아올림 조건(없음, 1회, 2회, 3회 이상), 결과 범위 검증을 수행합니다.
 */
import { WorksheetRule, Problem } from '../types';
import { countCarries } from '../analyzers/carry';
import { getRandomInt, pickRandom, getRangeForDigit } from './utils';

export function generateAdditionProblem(
  rule: WorksheetRule,
  index: number,
  isExample: boolean = false
): Problem | null {
  const digitA = pickRandom(rule.operandA.digits);
  const digitB = pickRandom(rule.operandB.digits);

  const rangeA = getRangeForDigit(digitA, rule.allowZero);
  const rangeB = getRangeForDigit(digitB, rule.allowZero);

  const minA = Math.max(rangeA.min, rule.operandA.min ?? rangeA.min);
  const maxA = Math.min(rangeA.max, rule.operandA.max ?? rangeA.max);
  const minB = Math.max(rangeB.min, rule.operandB.min ?? rangeB.min);
  const maxB = Math.min(rangeB.max, rule.operandB.max ?? rangeB.max);

  // 최대 300번 시도하여 규칙에 맞는 피연산자 추출
  for (let attempt = 0; attempt < 300; attempt++) {
    let a: number;
    let b: number;

    // 받아올림 없음(none) 최적화: 자릿수별 조립 우선 시도
    if (rule.carryCondition === 'none') {
      const generated = generateNoCarryAddition(digitA, digitB, rule.allowZero);
      a = generated.a;
      b = generated.b;
    } else if (rule.carryCondition === 'once' && attempt > 30) {
      // 30회 시도 후 미발견 시 자릿수 조립 활용
      const generated = generateSingleCarryAddition(digitA, digitB, rule.allowZero);
      a = generated.a;
      b = generated.b;
    } else {
      a = getRandomInt(minA, maxA);
      b = getRandomInt(minB, maxB);
    }

    // 범위 검증
    if (a < minA || a > maxA || b < minB || b > maxB) continue;

    // 끝자리 0 검증
    if (rule.operandA.allowZeroEnding === false && a % 10 === 0) continue;
    if (rule.operandB.allowZeroEnding === false && b % 10 === 0) continue;

    // 0 허용 여부 검증
    if (!rule.allowZero && (a === 0 || b === 0)) continue;

    // 받아올림 계산 및 검증
    const carries = countCarries(a, b);
    if (!matchesCarryCondition(carries, rule.carryCondition)) {
      continue;
    }

    const sum = a + b;
    if (rule.resultMin !== undefined && sum < rule.resultMin) continue;
    if (rule.resultMax !== undefined && sum > rule.resultMax) continue;

    const displayFormat = rule.displayFormat === 'mixed'
      ? (Math.random() > 0.5 ? 'horizontal' : 'vertical')
      : rule.displayFormat;

    return {
      id: `add-${index}-${a}-${b}`,
      index,
      operation: 'addition',
      operandA: a,
      operandB: b,
      answer: sum,
      carries,
      isExample,
      displayFormat,
    };
  }

  return null;
}

function matchesCarryCondition(carries: number, condition: string): boolean {
  switch (condition) {
    case 'none':
      return carries === 0;
    case 'once':
      return carries === 1;
    case 'twice':
      return carries === 2;
    case 'more':
      return carries >= 3;
    case 'any':
    default:
      return true;
  }
}

/** 받아올림이 전혀 없는 두 수를 자릿수별로 생성 */
function generateNoCarryAddition(digitA: number, digitB: number, allowZero: boolean): { a: number; b: number } {
  const maxDigits = Math.max(digitA, digitB);
  const digitsA: number[] = [];
  const digitsB: number[] = [];

  for (let i = 0; i < maxDigits; i++) {
    const isMostSigA = (i === digitA - 1);
    const isMostSigB = (i === digitB - 1);

    const minDigitA = (isMostSigA && (digitA > 1 || !allowZero)) ? 1 : 0;
    const minDigitB = (isMostSigB && (digitB > 1 || !allowZero)) ? 1 : 0;

    if (i >= digitA) {
      digitsB.push(getRandomInt(minDigitB, 9));
      continue;
    }
    if (i >= digitB) {
      digitsA.push(getRandomInt(minDigitA, 9));
      continue;
    }

    // 두 자리의 합이 9 이하여야 함 (받아올림 방지)
    const da = getRandomInt(minDigitA, 9 - minDigitB);
    const db = getRandomInt(minDigitB, 9 - da);
    digitsA.push(da);
    digitsB.push(db);
  }

  const a = digitsToNumber(digitsA.slice(0, digitA));
  const b = digitsToNumber(digitsB.slice(0, digitB));
  return { a, b };
}

/** 정확히 1회의 받아올림이 발생하는 두 수를 자릿수별로 생성 */
function generateSingleCarryAddition(digitA: number, digitB: number, allowZero: boolean): { a: number; b: number } {
  const maxCommonDigits = Math.min(digitA, digitB);
  // 받아올림이 일어날 자리 선택 (보통 일의 자리)
  const carryPos = getRandomInt(0, maxCommonDigits - 1);

  const digitsA: number[] = [];
  const digitsB: number[] = [];
  const maxDigits = Math.max(digitA, digitB);

  for (let i = 0; i < maxDigits; i++) {
    const isMostSigA = (i === digitA - 1);
    const isMostSigB = (i === digitB - 1);
    const minDigitA = (isMostSigA && (digitA > 1 || !allowZero)) ? 1 : 0;
    const minDigitB = (isMostSigB && (digitB > 1 || !allowZero)) ? 1 : 0;

    if (i === carryPos) {
      // 합이 10 이상이 되도록 선택 (일의 자리 또는 선택된 자리)
      const da = getRandomInt(Math.max(1, minDigitA), 9);
      const db = getRandomInt(Math.max(10 - da, minDigitB), 9);
      digitsA.push(da);
      digitsB.push(db);
    } else if (i === carryPos + 1) {
      // 바로 윗자리는 이전 자리의 carry(1)가 넘어오므로, 1 + da + db < 10 이어야 2회차 받아올림이 안 일어남
      const da = getRandomInt(minDigitA, Math.max(minDigitA, 8 - minDigitB));
      const db = getRandomInt(minDigitB, Math.max(minDigitB, 8 - da));
      digitsA.push(i < digitA ? da : 0);
      digitsB.push(i < digitB ? db : 0);
    } else {
      // 일반 자리: 합이 9 이하
      const da = getRandomInt(minDigitA, Math.max(minDigitA, 9 - minDigitB));
      const db = getRandomInt(minDigitB, Math.max(minDigitB, 9 - da));
      digitsA.push(i < digitA ? da : 0);
      digitsB.push(i < digitB ? db : 0);
    }
  }

  const a = digitsToNumber(digitsA.slice(0, digitA));
  const b = digitsToNumber(digitsB.slice(0, digitB));
  return { a, b };
}

function digitsToNumber(digits: number[]): number {
  let num = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    num = num * 10 + digits[i];
  }
  return num;
}
