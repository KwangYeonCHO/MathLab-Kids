import { describe, it, expect } from 'vitest';
import {
  gcd,
  lcm,
  toImproper,
  toMixed,
  simplifyFraction,
  isSimplestForm,
  isEquivalent,
  addFractions,
  subFractions,
  multiplyFractions,
  divideFractions,
  formatFraction,
  parseFractionString,
} from '../src/domain/math/core/fraction';

describe('분수(Fraction) 코어 수학 엔진 단위 테스트', () => {
  describe('최대공약수(GCD) 및 최소공배수(LCM)', () => {
    it('유클리드 호제법으로 최대공약수를 정확히 계산해야 함', () => {
      expect(gcd(12, 18)).toBe(6);
      expect(gcd(7, 13)).toBe(1);
      expect(gcd(24, 60)).toBe(12);
      expect(gcd(100, 25)).toBe(25);
    });

    it('최소공배수를 정확히 계산해야 함', () => {
      expect(lcm(4, 6)).toBe(12);
      expect(lcm(3, 5)).toBe(15);
      expect(lcm(12, 18)).toBe(36);
      expect(lcm(8, 12)).toBe(24);
    });
  });

  describe('대분수 / 가분수 상호 변환', () => {
    it('대분수를 가분수로 정확히 변환해야 함', () => {
      expect(toImproper({ whole: 2, numerator: 3, denominator: 4 })).toEqual({
        numerator: 11,
        denominator: 4,
      });
      expect(toImproper({ numerator: 5, denominator: 6 })).toEqual({
        numerator: 5,
        denominator: 6,
      });
    });

    it('가분수를 대분수 표준형으로 정확히 변환해야 함', () => {
      expect(toMixed({ numerator: 11, denominator: 4 })).toEqual({
        whole: 2,
        numerator: 3,
        denominator: 4,
      });
      expect(toMixed({ numerator: 3, denominator: 4 })).toEqual({
        whole: undefined,
        numerator: 3,
        denominator: 4,
      });
      expect(toMixed({ numerator: 8, denominator: 4 })).toEqual({
        whole: 2,
        numerator: 0,
        denominator: 1,
      });
    });
  });

  describe('약분 및 기약분수(Simplest Form) 판정', () => {
    it('분수를 올바르게 약분하여 기약 대분수로 변환해야 함', () => {
      // 6/8 -> 3/4
      expect(simplifyFraction({ numerator: 6, denominator: 8 })).toEqual({
        whole: undefined,
        numerator: 3,
        denominator: 4,
      });

      // 14/4 -> 3 또 1/2
      expect(simplifyFraction({ numerator: 14, denominator: 4 })).toEqual({
        whole: 3,
        numerator: 1,
        denominator: 2,
      });

      // 2 또 4/8 -> 2 또 1/2
      expect(simplifyFraction({ whole: 2, numerator: 4, denominator: 8 })).toEqual({
        whole: 2,
        numerator: 1,
        denominator: 2,
      });
    });

    it('기약분수 여부를 엄격하게 판별해야 함', () => {
      expect(isSimplestForm({ numerator: 3, denominator: 4 })).toBe(true);
      expect(isSimplestForm({ numerator: 6, denominator: 8 })).toBe(false);
      expect(isSimplestForm({ whole: 1, numerator: 1, denominator: 2 })).toBe(true);
      expect(isSimplestForm({ whole: 1, numerator: 2, denominator: 4 })).toBe(false);
      // 대분수인데 분자가 분모보다 큰 경우 false
      expect(isSimplestForm({ whole: 1, numerator: 5, denominator: 3 })).toBe(false);
    });

    it('동치분수(Equivalent Fractions)를 올바르게 인식해야 함', () => {
      expect(isEquivalent({ numerator: 1, denominator: 2 }, { numerator: 5, denominator: 10 })).toBe(true);
      expect(isEquivalent({ whole: 1, numerator: 1, denominator: 2 }, { numerator: 3, denominator: 2 })).toBe(true);
      expect(isEquivalent({ numerator: 2, denominator: 3 }, { numerator: 3, denominator: 4 })).toBe(false);
    });
  });

  describe('분수 사칙연산 무결성', () => {
    it('이분모 분수의 덧셈을 통분하여 기약분수로 계산해야 함', () => {
      // 1/2 + 1/3 = 5/6
      const res = addFractions({ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 });
      expect(res).toEqual({ whole: undefined, numerator: 5, denominator: 6 });

      // 3/4 + 2/4 = 5/4 = 1 또 1/4
      const res2 = addFractions({ numerator: 3, denominator: 4 }, { numerator: 2, denominator: 4 });
      expect(res2).toEqual({ whole: 1, numerator: 1, denominator: 4 });
    });

    it('분수의 뺄셈을 정확히 계산해야 함', () => {
      // 2 1/4 - 1 2/4 = 9/4 - 6/4 = 3/4
      const res = subFractions(
        { whole: 2, numerator: 1, denominator: 4 },
        { whole: 1, numerator: 2, denominator: 4 }
      );
      expect(res).toEqual({ whole: undefined, numerator: 3, denominator: 4 });
    });

    it('뺄셈 결과가 음수가 되면 예외를 던져야 함 (초등 교육과정 준수)', () => {
      expect(() =>
        subFractions({ numerator: 1, denominator: 4 }, { numerator: 3, denominator: 4 })
      ).toThrow();
    });

    it('분수의 곱셈과 약분을 정확히 계산해야 함', () => {
      // 2/3 * 3/4 = 6/12 = 1/2
      const res = multiplyFractions({ numerator: 2, denominator: 3 }, { numerator: 3, denominator: 4 });
      expect(res).toEqual({ whole: undefined, numerator: 1, denominator: 2 });

      // 1 1/2 * 2 = 3/2 * 2/1 = 3
      const res2 = multiplyFractions(
        { whole: 1, numerator: 1, denominator: 2 },
        { whole: 2, numerator: 0, denominator: 1 }
      );
      expect(res2).toEqual({ whole: 3, numerator: 0, denominator: 1 });
    });

    it('분수의 나눗셈(역수 곱셈)을 정확히 계산해야 함', () => {
      // 3/4 ÷ 1/2 = 3/4 * 2/1 = 6/4 = 1 또 1/2
      const res = divideFractions({ numerator: 3, denominator: 4 }, { numerator: 1, denominator: 2 });
      expect(res).toEqual({ whole: 1, numerator: 1, denominator: 2 });
    });
  });

  describe('분수 포맷팅 및 문자열 파싱', () => {
    it('포맷 함수가 직관적인 문자열을 생성해야 함', () => {
      expect(formatFraction({ whole: 2, numerator: 1, denominator: 3 })).toBe('2 1/3');
      expect(formatFraction({ numerator: 3, denominator: 4 })).toBe('3/4');
      expect(formatFraction({ whole: 5, numerator: 0, denominator: 1 })).toBe('5');
    });

    it('사용자 입력을 정확한 분수 객체로 파싱해야 함', () => {
      expect(parseFractionString('2 3/4')).toEqual({ whole: 2, numerator: 3, denominator: 4 });
      expect(parseFractionString('3/4')).toEqual({ numerator: 3, denominator: 4 });
      expect(parseFractionString('7')).toEqual({ whole: 7, numerator: 0, denominator: 1 });
      expect(parseFractionString('')).toBeNull();
    });
  });
});
