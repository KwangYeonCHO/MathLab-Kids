/**
 * MathLab Kids - 분수(Fraction) 코어 수학 라이브러리
 * 대한민국 2022 개정 초등 교육과정 기준:
 * - 기약분수(Irreducible fraction) 판정 및 약분
 * - 통분(Common denominator) 및 분모가 다른 분수의 사칙연산
 * - 진분수, 가분수, 대분수(Mixed fraction) 상호 변환
 */

export interface FractionValue {
  whole?: number;       // 자연수 부분 (대분수: 1 이상, 진분수/가분수: 0 또는 생략)
  numerator: number;   // 분자 (0 이상의 정수)
  denominator: number; // 분모 (1 이상의 자연수)
}

/**
 * 최대공약수 (Greatest Common Divisor - 유클리드 호제법)
 */
export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x === 0 ? 1 : x;
}

/**
 * 최소공배수 (Least Common Multiple)
 */
export function lcm(a: number, b: number): number {
  const x = Math.abs(Math.round(a));
  const y = Math.abs(Math.round(b));
  if (x === 0 || y === 0) return 0;
  return Math.round((x * y) / gcd(x, y));
}

/**
 * 대분수 또는 일반 분수를 순수 가분수(Improper fraction) 형태로 정규화합니다.
 * 예: 2又 3/4 -> 11/4
 */
export function toImproper(f: FractionValue): { numerator: number; denominator: number } {
  if (f.denominator <= 0) {
    throw new Error('분모는 0보다 큰 자연수여야 합니다.');
  }
  const whole = f.whole && f.whole > 0 ? f.whole : 0;
  const numerator = whole * f.denominator + f.numerator;
  return {
    numerator,
    denominator: f.denominator,
  };
}

/**
 * 가분수를 초등학교 대분수(Mixed fraction) 표준형으로 변환합니다.
 * 예: 11/4 -> { whole: 2, numerator: 3, denominator: 4 }
 * 예: 3/4  -> { whole: undefined, numerator: 3, denominator: 4 }
 * 예: 8/4  -> { whole: 2, numerator: 0, denominator: 1 } (정수로 떨어지는 경우)
 */
export function toMixed(f: FractionValue): FractionValue {
  const improper = toImproper(f);
  const whole = Math.floor(improper.numerator / improper.denominator);
  const remainderNumerator = improper.numerator % improper.denominator;

  return {
    whole: whole > 0 ? whole : undefined,
    numerator: remainderNumerator,
    denominator: remainderNumerator === 0 ? 1 : improper.denominator,
  };
}

/**
 * 분수를 기약분수(약분 완료된 형태)로 변환합니다.
 * asMixed가 true이면 대분수 기약분수로 변환합니다 (초등 5학년 2학기 이상 기본값).
 */
export function simplifyFraction(f: FractionValue, asMixed: boolean = true): FractionValue {
  const improper = toImproper(f);
  if (improper.numerator === 0) {
    return { whole: undefined, numerator: 0, denominator: 1 };
  }

  const divisor = gcd(improper.numerator, improper.denominator);
  const simpNumerator = Math.round(improper.numerator / divisor);
  const simpDenominator = Math.round(improper.denominator / divisor);

  if (asMixed) {
    const whole = Math.floor(simpNumerator / simpDenominator);
    const remNum = simpNumerator % simpDenominator;
    return {
      whole: whole > 0 ? whole : undefined,
      numerator: remNum,
      denominator: remNum === 0 ? 1 : simpDenominator,
    };
  }

  return {
    whole: undefined,
    numerator: simpNumerator,
    denominator: simpDenominator,
  };
}

/**
 * 분수가 기약분수 형태인지 판정합니다.
 * 분자와 분모의 최대공약수가 1이고, 대분수일 경우 분자가 분모보다 작아야 합니다.
 */
export function isSimplestForm(f: FractionValue): boolean {
  if (f.denominator <= 0) return false;
  if (f.numerator === 0) return f.denominator === 1;

  // 대분수일 때 분자가 분모보다 크거나 같으면 기약 대분수가 아님
  if (f.whole && f.whole > 0 && f.numerator >= f.denominator) {
    return false;
  }

  return gcd(f.numerator, f.denominator) === 1;
}

/**
 * 두 분수의 크기(동치 관계)가 동일한지 판정합니다.
 * 예: 1/2 == 2/4 == 3/6
 */
export function isEquivalent(f1: FractionValue, f2: FractionValue): boolean {
  const imp1 = toImproper(f1);
  const imp2 = toImproper(f2);
  return imp1.numerator * imp2.denominator === imp2.numerator * imp1.denominator;
}

/**
 * 분수의 덧셈 (통분 자동 처리)
 */
export function addFractions(f1: FractionValue, f2: FractionValue, asMixed: boolean = true): FractionValue {
  const imp1 = toImproper(f1);
  const imp2 = toImproper(f2);
  const commonDenom = lcm(imp1.denominator, imp2.denominator);
  const num1 = imp1.numerator * (commonDenom / imp1.denominator);
  const num2 = imp2.numerator * (commonDenom / imp2.denominator);
  const resNum = num1 + num2;

  return simplifyFraction({ numerator: resNum, denominator: commonDenom }, asMixed);
}

/**
 * 분수의 뺄셈 (초등 교육과정상 f1 >= f2 보장 필요)
 */
export function subFractions(f1: FractionValue, f2: FractionValue, asMixed: boolean = true): FractionValue {
  const imp1 = toImproper(f1);
  const imp2 = toImproper(f2);
  const commonDenom = lcm(imp1.denominator, imp2.denominator);
  const num1 = imp1.numerator * (commonDenom / imp1.denominator);
  const num2 = imp2.numerator * (commonDenom / imp2.denominator);

  if (num1 < num2) {
    throw new Error('초등 수학 교육과정에서는 분수 뺄셈 결과가 음수가 될 수 없습니다.');
  }

  const resNum = num1 - num2;
  return simplifyFraction({ numerator: resNum, denominator: commonDenom }, asMixed);
}

/**
 * 분수의 곱셈 (약분 및 대분수 처리)
 */
export function multiplyFractions(f1: FractionValue, f2: FractionValue, asMixed: boolean = true): FractionValue {
  const imp1 = toImproper(f1);
  const imp2 = toImproper(f2);
  const resNum = imp1.numerator * imp2.numerator;
  const resDenom = imp1.denominator * imp2.denominator;

  return simplifyFraction({ numerator: resNum, denominator: resDenom }, asMixed);
}

/**
 * 분수의 나눗셈 (역수 곱셈 변환)
 */
export function divideFractions(f1: FractionValue, f2: FractionValue, asMixed: boolean = true): FractionValue {
  const imp1 = toImproper(f1);
  const imp2 = toImproper(f2);

  if (imp2.numerator === 0) {
    throw new Error('0으로 나눌 수 없습니다.');
  }

  const resNum = imp1.numerator * imp2.denominator;
  const resDenom = imp1.denominator * imp2.numerator;

  return simplifyFraction({ numerator: resNum, denominator: resDenom }, asMixed);
}

/**
 * 분수를 직관적인 텍스트로 포맷합니다.
 * 예: { whole: 2, numerator: 1, denominator: 3 } -> "2 1/3"
 * 예: { numerator: 3, denominator: 4 } -> "3/4"
 * 예: { whole: 5, numerator: 0, denominator: 1 } -> "5"
 */
export function formatFraction(f: FractionValue): string {
  const whole = f.whole && f.whole > 0 ? f.whole : 0;
  if (f.numerator === 0) {
    return whole.toString();
  }
  if (whole > 0) {
    return `${whole} ${f.numerator}/${f.denominator}`;
  }
  return `${f.numerator}/${f.denominator}`;
}

/**
 * 텍스트 입력을 FractionValue 객체로 파싱합니다.
 * "2 3/4", "11/4", "5" 등을 완벽하게 파싱합니다.
 */
export function parseFractionString(input: string): FractionValue | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 단일 정수 (예: "5")
  if (/^\d+$/.test(trimmed)) {
    return {
      whole: parseInt(trimmed, 10),
      numerator: 0,
      denominator: 1,
    };
  }

  // 대분수 (예: "2 3/4" 또는 "2_3/4")
  const mixedMatch = trimmed.match(/^(\d+)[\s_]+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const numerator = parseInt(mixedMatch[2], 10);
    const denominator = parseInt(mixedMatch[3], 10);
    if (denominator === 0) return null;
    return { whole, numerator, denominator };
  }

  // 진분수/가분수 (예: "3/4", "11/4")
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    if (denominator === 0) return null;
    return { numerator, denominator };
  }

  return null;
}
