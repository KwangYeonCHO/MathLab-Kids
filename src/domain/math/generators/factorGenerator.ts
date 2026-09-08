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

  // 최대공약수가 1보다 큰 흥미로운 두 수 생성
  for (let attempt = 0; attempt < 30; attempt++) {
    const common = getRandomInt(2, 12);
    const m = getRandomInt(2, 8);
    let n = getRandomInt(2, 8);
    if (m === n) n = m + 1;

    const numA = common * m;
    const numB = common * n;

    if (numA <= maxNum && numB <= maxNum && numA !== numB) {
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
