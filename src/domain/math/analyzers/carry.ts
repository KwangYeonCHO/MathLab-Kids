/**
 * 덧셈 받아올림(Carry) 정밀 계산 및 분석기
 * 한국 초등 수학 연산 기준: 일, 십, 백의 자리 등 각 자릿수에서 10 이상이 되어
 * 윗자리로 올라가는 횟수 및 위치를 정확하게 계산합니다.
 */

export interface CarryAnalysis {
  count: number;
  // 각 자리별 받아올림 발생 여부 (0: 일의 자리, 1: 십의 자리, 2: 백의 자리 ...)
  positions: number[];
}

export function countCarries(a: number, b: number): number {
  return analyzeCarries(a, b).count;
}

export function analyzeCarries(a: number, b: number): CarryAnalysis {
  let carry = 0;
  let count = 0;
  const positions: number[] = [];
  
  let tempA = Math.floor(Math.abs(a));
  let tempB = Math.floor(Math.abs(b));
  let position = 0;

  while (tempA > 0 || tempB > 0) {
    const digitA = tempA % 10;
    const digitB = tempB % 10;
    const sum = digitA + digitB + carry;
    
    if (sum >= 10) {
      carry = 1;
      count++;
      positions.push(position);
    } else {
      carry = 0;
    }
    
    tempA = Math.floor(tempA / 10);
    tempB = Math.floor(tempB / 10);
    position++;
  }

  return { count, positions };
}
