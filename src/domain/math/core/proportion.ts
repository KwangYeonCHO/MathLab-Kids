/**
 * MathLab Kids - 비와 비율 / 비례식(Ratio & Proportion) 코어 라이브러리
 * 대한민국 2022 개정 초등 6학년 기준:
 * - 비의 성질을 이용한 가장 간단한 자연수의 비로 나타내기
 * - 비례식에서 미지항(Unknown) 구하기 (외항의 곱 = 내항의 곱)
 * - 비례배분(Proportional distribution) 연산
 * - 비율의 백분율(%) 환산
 */
import { gcd } from './fraction';
import { countDecimals } from './decimal';

export interface Ratio {
  antecedent: number; // 전항 (A)
  consequent: number; // 후항 (B)
}

/**
 * 두 수의 비를 가장 간단한 자연수의 비(Simplest Integer Ratio)로 변환합니다.
 * 예: 12 : 18 -> 2 : 3
 * 예: 0.4 : 0.6 -> 2 : 3
 */
export function simplifyRatio(a: number, b: number): Ratio {
  if (a <= 0 || b <= 0) {
    throw new Error('비의 전항과 후항은 0보다 커야 합니다.');
  }

  // 소수가 포함되어 있으면 10의 거듭제곱을 곱해 자연수로 변환
  const decA = countDecimals(a);
  const decB = countDecimals(b);
  const maxDec = Math.max(decA, decB);
  const factor = Math.pow(10, maxDec);

  let intA = Math.round(a * factor);
  let intB = Math.round(b * factor);

  const divisor = gcd(intA, intB);
  return {
    antecedent: Math.round(intA / divisor),
    consequent: Math.round(intB / divisor),
  };
}

export type ProportionPosition = 'A' | 'B' | 'C' | 'D'; // A : B = C : D

/**
 * 비례식 A : B = C : D 에서 비어 있는 미지항의 값을 계산합니다.
 * 비례식의 성질: 외항의 곱(A × D) = 내항의 곱(B × C)
 */
export function solveProportion(
  a: number | null,
  b: number | null,
  c: number | null,
  d: number | null
): { unknownPos: ProportionPosition; value: number } {
  // A : B = C : D
  if (a === null && b !== null && c !== null && d !== null) {
    if (d === 0) throw new Error('외항 D는 0일 수 없습니다.');
    const val = (b * c) / d;
    return { unknownPos: 'A', value: Math.round(val * 1000) / 1000 };
  }
  if (b === null && a !== null && c !== null && d !== null) {
    if (c === 0) throw new Error('내항 C는 0일 수 없습니다.');
    const val = (a * d) / c;
    return { unknownPos: 'B', value: Math.round(val * 1000) / 1000 };
  }
  if (c === null && a !== null && b !== null && d !== null) {
    if (b === 0) throw new Error('내항 B는 0일 수 없습니다.');
    const val = (a * d) / b;
    return { unknownPos: 'C', value: Math.round(val * 1000) / 1000 };
  }
  if (d === null && a !== null && b !== null && c !== null) {
    if (a === 0) throw new Error('외항 A는 0일 수 없습니다.');
    const val = (b * c) / a;
    return { unknownPos: 'D', value: Math.round(val * 1000) / 1000 };
  }

  throw new Error('정확히 하나의 미지항(null)이 주어져야 합니다.');
}

/**
 * 비례배분 계산
 * 전체 수량 total을 a : b의 비로 배분합니다.
 * 예: 300을 2 : 3 으로 배분 -> partA = 120, partB = 180
 */
export function proportionalDistribution(
  total: number,
  ratioA: number,
  ratioB: number
): { partA: number; partB: number } {
  const sumRatio = ratioA + ratioB;
  if (sumRatio <= 0) {
    throw new Error('비의 합은 0보다 커야 합니다.');
  }

  const partA = Math.round((total * ratioA) / sumRatio);
  const partB = Math.round((total * ratioB) / sumRatio);

  if (partA + partB !== total) {
    throw new Error('비례배분 결과의 합이 전체 수량과 일치하지 않습니다.');
  }

  return { partA, partB };
}

/**
 * 기준량 대비 비교하는 양의 백분율(%)을 계산합니다.
 * 예: 15 / 60 -> 25 (%)
 */
export function calculatePercentage(part: number, whole: number): number {
  if (whole === 0) throw new Error('기준량은 0이 될 수 없습니다.');
  return Math.round((part / whole) * 10000) / 100;
}
