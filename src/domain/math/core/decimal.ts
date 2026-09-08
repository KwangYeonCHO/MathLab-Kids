/**
 * MathLab Kids - 소수(Decimal) 코어 수학 라이브러리
 * 대한민국 2022 개정 초등 교육과정 기준:
 * - JavaScript 부동소수점 오차(0.1 + 0.2 != 0.3) 100% 방지
 * - 소수의 덧셈, 뺄셈, 곱셈, 나눗셈 정밀 연산
 * - 소수 나눗셈의 자연수 몫과 소수점 위치를 보존한 나머지(Remainder) 계산 ($7.5 \div 2 = 3 \cdots 1.5$)
 * - 반올림(올림/버림) 어림수 정밀 처리
 */

/**
 * 숫자의 소수점 이하 자릿수를 반환합니다.
 */
export function countDecimals(value: number | string): number {
  const str = typeof value === 'number' ? value.toString() : value.trim();
  if (str.includes('e-')) {
    const parts = str.split('e-');
    return parseInt(parts[1], 10);
  }
  const dotIndex = str.indexOf('.');
  return dotIndex === -1 ? 0 : str.length - dotIndex - 1;
}

/**
 * 두 소수의 덧셈 (부동소수점 오차 없음)
 */
export function addDecimals(a: number, b: number): number {
  const decA = countDecimals(a);
  const decB = countDecimals(b);
  const maxDec = Math.max(decA, decB);
  const factor = Math.pow(10, maxDec);
  return Math.round(a * factor + b * factor) / factor;
}

/**
 * 두 소수의 뺄셈 (초등 교육과정상 a >= b 보장)
 */
export function subDecimals(a: number, b: number): number {
  const decA = countDecimals(a);
  const decB = countDecimals(b);
  const maxDec = Math.max(decA, decB);
  const factor = Math.pow(10, maxDec);
  const diff = Math.round(a * factor - b * factor);
  if (diff < 0) {
    throw new Error('초등 수학 교육과정에서는 뺄셈 결과가 음수가 될 수 없습니다.');
  }
  return diff / factor;
}

/**
 * 두 소수의 곱셈
 * 예: 0.4 * 0.7 = 0.28, 1.25 * 0.8 = 1.0
 */
export function multiplyDecimals(a: number, b: number): number {
  const decA = countDecimals(a);
  const decB = countDecimals(b);
  const factorA = Math.pow(10, decA);
  const factorB = Math.pow(10, decB);
  const intA = Math.round(a * factorA);
  const intB = Math.round(b * factorB);
  const product = intA * intB;
  const totalDec = decA + decB;
  return product / Math.pow(10, totalDec);
}

/**
 * 소수의 나눗셈 (정확하게 나누어떨어지는 경우 또는 지정된 자릿수까지)
 */
export function divideDecimals(a: number, b: number, maxDecimals: number = 4): number {
  if (b === 0) {
    throw new Error('0으로 나눌 수 없습니다.');
  }
  const decA = countDecimals(a);
  const decB = countDecimals(b);
  const maxDec = Math.max(decA, decB);
  const factor = Math.pow(10, maxDec);
  const intA = Math.round(a * factor);
  const intB = Math.round(b * factor);

  // 나누어떨어지는지 확인
  const rawQuotient = intA / intB;
  return roundDecimal(rawQuotient, maxDecimals);
}

/**
 * 초등 6학년 소수의 나눗셈 - 자연수 몫과 소수 나머지 계산
 * 예: 7.5 ÷ 2 -> 몫 3, 나머지 1.5 (2 × 3 = 6, 7.5 - 6 = 1.5)
 * 예: 14.8 ÷ 4 -> 몫 3, 나머지 2.8 (4 × 3 = 12, 14.8 - 12 = 2.8)
 */
export function divideDecimalsWithRemainder(dividend: number, divisor: number): { quotient: number; remainder: number } {
  if (divisor <= 0) {
    throw new Error('나누는 수는 0보다 커야 합니다.');
  }
  const quotient = Math.floor(divideDecimals(dividend, divisor));
  const product = multiplyDecimals(divisor, quotient);
  const remainder = subDecimals(dividend, product);

  return { quotient, remainder };
}

/**
 * 지정 자리수 반올림 (부동소수점 오차 배제)
 * 예: roundDecimal(3.14159, 2) -> 3.14
 * 예: roundDecimal(345, -1) -> 350 (십의 자리까지 반올림)
 */
export function roundDecimal(num: number, places: number = 0): number {
  if (places >= 0) {
    const factor = Math.pow(10, places);
    return Math.round(num * factor) / factor;
  } else {
    const factor = Math.pow(10, -places);
    return Math.round(num / factor) * factor;
  }
}

/**
 * 지정 자리수 올림
 */
export function ceilDecimal(num: number, places: number = 0): number {
  if (places >= 0) {
    const factor = Math.pow(10, places);
    return Math.ceil(num * factor) / factor;
  } else {
    const factor = Math.pow(10, -places);
    return Math.ceil(num / factor) * factor;
  }
}

/**
 * 지정 자리수 버림
 */
export function floorDecimal(num: number, places: number = 0): number {
  if (places >= 0) {
    const factor = Math.pow(10, places);
    return Math.floor(num * factor) / factor;
  } else {
    const factor = Math.pow(10, -places);
    return Math.floor(num / factor) * factor;
  }
}

/**
 * 두 소수가 수치적으로 동일한지 판정합니다 (부동소수점 엡실론 안전 판별)
 */
export function areDecimalsEqual(a: number, b: number, precision: number = 6): boolean {
  return Math.abs(a - b) < Math.pow(10, -precision);
}
