/**
 * 수학 연산 생성기 유틸리티 함수
 */
import { Operation, UniqueMode, Problem } from '../types';

export function getRandomInt(min: number, max: number): number {
  const cmin = Math.ceil(min);
  const cmax = Math.floor(max);
  return Math.floor(Math.random() * (cmax - cmin + 1)) + cmin;
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getRangeForDigit(digit: number, allowZero: boolean = false): { min: number; max: number } {
  if (digit === 1) {
    return { min: allowZero ? 0 : 1, max: 9 };
  }
  const min = Math.pow(10, digit - 1);
  const max = Math.pow(10, digit) - 1;
  return { min, max };
}

export function makeProblemKey(
  operation: Operation,
  a: number,
  b: number,
  uniqueMode: UniqueMode,
  problem?: Problem
): string {
  if (problem) {
    if (problem.category === 'fraction' && problem.fractionA && problem.fractionB) {
      const fA = `${problem.fractionA.whole || 0}_${problem.fractionA.numerator}/${problem.fractionA.denominator}`;
      const fB = `${problem.fractionB.whole || 0}_${problem.fractionB.numerator}/${problem.fractionB.denominator}`;
      return `frac:${operation}:${fA}:${fB}`;
    }
    if (problem.category === 'mixed_operation' && problem.expression) {
      return `mix:${problem.expression}`;
    }
    if (problem.category === 'proportion' && problem.proportion) {
      const p = problem.proportion;
      return `prop:${p.a}:${p.b}=${p.c}:${p.d}`;
    }
    if (problem.category === 'factors_multiples') {
      return `fact:${problem.factorProblemType}:${problem.operandA},${problem.operandB}`;
    }
  }

  if (uniqueMode === 'commutative' && (operation === 'addition' || operation === 'multiplication')) {
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    return `${operation}:${min},${max}`;
  }
  return `${operation}:${a},${b}`;
}
