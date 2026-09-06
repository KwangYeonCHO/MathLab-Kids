/**
 * 뺄셈 문제 생성기 (Subtraction Generator)
 * 자릿수 조합, 음수 방지, 받아내림 조건(없음, 1회, 2회, 연속 받아내림), 결과 범위 검증을 수행합니다.
 */
import { WorksheetRule, Problem } from '../types';
import { analyzeBorrows } from '../analyzers/borrow';
import { getRandomInt, pickRandom, getRangeForDigit } from './utils';

export function generateSubtractionProblem(
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

  for (let attempt = 0; attempt < 300; attempt++) {
    let a: number;
    let b: number;

    if (rule.borrowCondition === 'none') {
      const generated = generateNoBorrowSubtraction(digitA, digitB, rule.allowZero);
      a = generated.a;
      b = generated.b;
    } else {
      a = getRandomInt(minA, maxA);
      b = getRandomInt(minB, maxB);
    }

    // 초등 기본: A >= B (음수 방지)
    if (!rule.allowNegative && a < b) {
      if (digitA === digitB) {
        // 자릿수가 같으면 둘을 교환하여 a >= b 보장
        [a, b] = [b, a];
      } else if (digitA > digitB) {
        // a의 자릿수가 더 크면 당연히 a > b여야 함
        continue;
      } else {
        // digitA < digitB 인데 음수 불허면 이 조합은 생성 불가
        continue;
      }
    }

    // 범위 재확인
    if (a < minA || a > maxA || b < minB || b > maxB) continue;

    // 끝자리 0 검증
    if (rule.operandA.allowZeroEnding === false && a % 10 === 0) continue;
    if (rule.operandB.allowZeroEnding === false && b % 10 === 0) continue;

    // 0 허용 여부 검증
    if (!rule.allowZero && (a === 0 || b === 0)) continue;

    const diff = a - b;
    if (!rule.allowNegative && diff < 0) continue;

    // 받아내림 분석 및 조건 검증
    const analysis = analyzeBorrows(a, b);
    if (!matchesBorrowCondition(analysis, rule.borrowCondition)) {
      continue;
    }

    if (rule.resultMin !== undefined && diff < rule.resultMin) continue;
    if (rule.resultMax !== undefined && diff > rule.resultMax) continue;

    const displayFormat = rule.displayFormat === 'mixed'
      ? (Math.random() > 0.5 ? 'horizontal' : 'vertical')
      : rule.displayFormat;

    return {
      id: `sub-${index}-${a}-${b}`,
      index,
      operation: 'subtraction',
      operandA: a,
      operandB: b,
      answer: diff,
      borrows: analysis.count,
      isExample,
      displayFormat,
    };
  }

  return null;
}

function matchesBorrowCondition(
  analysis: { count: number; hasContinuousBorrow: boolean },
  condition: string
): boolean {
  switch (condition) {
    case 'none':
      return analysis.count === 0;
    case 'once':
      return analysis.count === 1;
    case 'twice':
      return analysis.count === 2;
    case 'continuous':
      return analysis.hasContinuousBorrow;
    case 'any':
    default:
      return true;
  }
}

/** 받아내림이 전혀 없는 뺄셈 생성: 각 자리마다 a_i >= b_i */
function generateNoBorrowSubtraction(digitA: number, digitB: number, allowZero: boolean): { a: number; b: number } {
  const digitsA: number[] = [];
  const digitsB: number[] = [];

  for (let i = 0; i < digitA; i++) {
    const isMostSigA = (i === digitA - 1);
    const minA = (isMostSigA && (digitA > 1 || !allowZero)) ? 1 : 0;
    const da = getRandomInt(minA, 9);
    digitsA.push(da);

    if (i < digitB) {
      const isMostSigB = (i === digitB - 1);
      const minB = (isMostSigB && (digitB > 1 || !allowZero)) ? 1 : 0;
      // da >= db 여야 받아내림이 안 생김
      const db = getRandomInt(minB, Math.max(minB, da));
      digitsB.push(db);
    }
  }

  const a = digitsToNumber(digitsA);
  const b = digitsToNumber(digitsB);
  return { a, b };
}

function digitsToNumber(digits: number[]): number {
  let num = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    num = num * 10 + digits[i];
  }
  return num;
}
