/**
 * MathLab Kids - 비와 비율 / 비례식 문제 생성기 (Proportion Generator)
 * 대한민국 2022 개정 초등 6학년 기준:
 * - 비례식에서 미지항(□) 구하기 (A : B = C : □)
 * - 가장 간단한 자연수의 비로 나타내기
 * - 백분율(%) 계산
 */
import { Problem, WorksheetRule } from '../types';
import { solveProportion, simplifyRatio, calculatePercentage } from '../core/proportion';
import { getRandomInt } from './utils';

export function generateProportionProblem(
  rule: WorksheetRule,
  index: number,
  isExample: boolean = false
): Problem | null {
  const pRule = rule.proportionRule || {
    type: 'solve_proportion',
  };

  if (pRule.type === 'solve_proportion') {
    // A : B = C : D 비례식 미지항 문제 생성
    // 기본 배수 k (2 ~ 8)
    const k = getRandomInt(2, 8);
    const baseA = getRandomInt(2, 9);
    const baseB = getRandomInt(2, 9);

    const a = baseA;
    const b = baseB;
    const c = baseA * k;
    const d = baseB * k;

    // 미지항 위치 결정 (A, B, C, D 중 하나) - 초등에서는 주로 C나 D
    const positions: ('C' | 'D')[] = ['C', 'D'];
    const unknownPos = positions[getRandomInt(0, positions.length - 1)];

    let probA: number | null = a;
    let probB: number | null = b;
    let probC: number | null = c;
    let probD: number | null = d;

    if (unknownPos === 'C') probC = null;
    if (unknownPos === 'D') probD = null;

    const solved = solveProportion(probA, probB, probC, probD);

    return {
      id: `prop_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      index,
      operation: 'multiplication',
      category: 'proportion',
      operandA: a,
      operandB: b,
      answer: solved.value,
      proportion: {
        a: probA,
        b: probB,
        c: probC,
        d: probD,
        unknownPos,
      },
      isExample,
      displayFormat: 'horizontal',
    };
  }

  return null;
}
