/**
 * 뺄셈 받아내림(Borrow/Regrouping) 정밀 계산 및 분석기
 * 한국 초등 수학 연산 기준: A - B (A >= B)에서 각 자릿수 뺄셈 시
 * 윗자리에서 10을 빌려와야 하는 횟수 및 0을 거치는 연속 받아내림 여부를 판별합니다.
 */

export interface BorrowAnalysis {
  count: number;
  positions: number[]; // 받아내림이 일어난 자릿수 (0: 일의 자리, 1: 십의 자리 등)
  hasContinuousBorrow: boolean; // 0인 자릿수를 거쳐 받아내림이 발생하는지 여부 (예: 102 - 5)
}

export function countBorrows(a: number, b: number): number {
  return analyzeBorrows(a, b).count;
}

export function analyzeBorrows(a: number, b: number): BorrowAnalysis {
  if (a < b) {
    // 음수가 되는 경우는 초등 기본 연산에서는 a >= b를 전제함
    return { count: 0, positions: [], hasContinuousBorrow: false };
  }

  let count = 0;
  const positions: number[] = [];
  let hasContinuousBorrow = false;

  // 자릿수 배열 추출 (낮은 자릿수부터: [일, 십, 백, ...])
  const digitsA: number[] = [];
  let tempA = Math.floor(a);
  if (tempA === 0) digitsA.push(0);
  while (tempA > 0) {
    digitsA.push(tempA % 10);
    tempA = Math.floor(tempA / 10);
  }

  const digitsB: number[] = [];
  let tempB = Math.floor(b);
  if (tempB === 0) digitsB.push(0);
  while (tempB > 0) {
    digitsB.push(tempB % 10);
    tempB = Math.floor(tempB / 10);
  }

  // 자릿수 맞추기
  while (digitsB.length < digitsA.length) {
    digitsB.push(0);
  }

  for (let i = 0; i < digitsA.length; i++) {
    const sub = digitsB[i];
    if (digitsA[i] < sub) {
      count++;
      positions.push(i);

      // 바로 윗자리들에서 빌려오기
      let j = i + 1;
      while (j < digitsA.length && digitsA[j] === 0) {
        digitsA[j] = 9;
        hasContinuousBorrow = true;
        j++;
      }

      if (j < digitsA.length) {
        digitsA[j] -= 1;
      }
      digitsA[i] += 10;
    }
  }

  return { count, positions, hasContinuousBorrow };
}
