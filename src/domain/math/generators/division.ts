/**
 * 나눗셈 문제 생성기 (Division Generator)
 * 나머지가 없는 나눗셈 / 나머지가 있는 나눗셈(0 < 나머지 < 나누는 수)을 완벽하게 생성합니다.
 */
import { WorksheetRule, Problem } from '../types';
import { getRandomInt, pickRandom, getRangeForDigit } from './utils';

export function generateDivisionProblem(
  rule: WorksheetRule,
  index: number,
  isExample: boolean = false
): Problem | null {
  const digitA = pickRandom(rule.operandA.digits); // 피제수 (나누어지는 수) 자릿수
  const digitB = pickRandom(rule.operandB.digits); // 제수 (나누는 수) 자릿수

  const rangeA = getRangeForDigit(digitA, false); // 0으로 나누기 및 0 피제수 방지
  const rangeB = getRangeForDigit(digitB, false);

  const minA = Math.max(rangeA.min, rule.operandA.min ?? rangeA.min);
  const maxA = Math.min(rangeA.max, rule.operandA.max ?? rangeA.max);
  const minB = Math.max(rangeB.min, rule.operandB.min ?? rangeB.min);
  const maxB = Math.min(rangeB.max, rule.operandB.max ?? rangeB.max);

  // 나머지 모드 결정
  let needRemainder: boolean;
  if (rule.divisionCondition === 'none') {
    needRemainder = false;
  } else if (rule.divisionCondition === 'required') {
    needRemainder = true;
  } else {
    // mixed: 50% 확률로 섞기
    needRemainder = Math.random() > 0.5;
  }

  for (let attempt = 0; attempt < 300; attempt++) {
    // 나누는 수 B 선정 (나머지가 필요한 경우 최소 2 이상이어야 0 < R < B 가능)
    const effectiveMinB = needRemainder ? Math.max(2, minB) : Math.max(1, minB);
    if (effectiveMinB > maxB) continue;

    const b = getRandomInt(effectiveMinB, maxB);

    // 몫 Q의 범위 산출: A = B * Q + R 에서 A가 [minA, maxA]에 들어가도록
    const minQ = Math.max(1, Math.floor(minA / b));
    const maxQ = Math.floor(maxA / b);
    if (minQ > maxQ) continue;

    const q = getRandomInt(minQ, maxQ);

    let r = 0;
    if (needRemainder) {
      // 0 < 나머지 < 나누는 수
      r = getRandomInt(1, b - 1);
    }

    const a = b * q + r;

    // A가 실제 자릿수 및 범위 내에 있는지 엄격 검증
    if (a < minA || a > maxA) continue;

    // 끝자리 0 검증
    if (rule.operandA.allowZeroEnding === false && a % 10 === 0) continue;
    if (rule.operandB.allowZeroEnding === false && b % 10 === 0) continue;

    if (rule.resultMin !== undefined && q < rule.resultMin) continue;
    if (rule.resultMax !== undefined && q > rule.resultMax) continue;

    // 최종 산술 검증: a === b * q + r, r < b
    if (Math.floor(a / b) !== q || a % b !== r) continue;
    if (needRemainder && (r <= 0 || r >= b)) continue;

    const displayFormat = rule.displayFormat === 'mixed'
      ? (Math.random() > 0.5 ? 'horizontal' : 'vertical')
      : rule.displayFormat;

    return {
      id: `div-${index}-${a}-${b}`,
      index,
      operation: 'division',
      operandA: a,
      operandB: b,
      answer: q,
      remainder: r > 0 ? r : undefined,
      isExample,
      displayFormat,
    };
  }

  return null;
}
