/**
 * MathLab Kids - 약수와 배수(최대공약수/최소공배수) 문제 생성기
 * 대한민국 2022 개정 초등 5학년 1학기 기준:
 * - 두 수의 최대공약수(GCD) 구하기
 * - 두 수의 최소공배수(LCM) 구하기
 */
import { Problem, WorksheetRule } from '../types';
import { gcd, lcm } from '../core/fraction';
import { getRandomInt } from './utils';

export function generateFactorProblem(
  rule: WorksheetRule,
  index: number,
  isExample: boolean = false
): Problem | null {
  const fRule = rule.factorRule || {
    type: 'gcd',
    maxNumber: 50,
  };

  const isGcd = fRule.type === 'gcd';
  const maxNum = fRule.maxNumber || 50;

  const effectiveMax = Math.max(12, maxNum);
  const maxCommon = Math.max(2, Math.floor(effectiveMax / 3));

  // 최대공약수가 1보다 큰 흥미로운 두 수 생성
  for (let attempt = 0; attempt < 50; attempt++) {
    const common = getRandomInt(2, Math.min(12, maxCommon));
    const maxMultiplier = Math.max(3, Math.floor(effectiveMax / common));
    const m = getRandomInt(2, Math.min(8, maxMultiplier));
    let n = getRandomInt(2, Math.min(8, maxMultiplier));
    if (m === n) {
      n = m < maxMultiplier ? m + 1 : m - 1;
    }
    if (n < 2) continue;

    const numA = common * m;
    const numB = common * n;

    if (numA <= effectiveMax && numB <= effectiveMax && numA !== numB) {
      const answer = isGcd ? gcd(numA, numB) : lcm(numA, numB);

      return {
        id: `fact_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        index,
        operation: isGcd ? 'division' : 'multiplication',
        category: 'factors_multiples',
        operandA: Math.min(numA, numB),
        operandB: Math.max(numA, numB),
        answer,
        factorProblemType: isGcd ? 'gcd' : 'lcm',
        isExample,
        displayFormat: 'horizontal',
      };
    }
  }

  return null;
}
