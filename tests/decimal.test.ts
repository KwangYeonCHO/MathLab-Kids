import { describe, it, expect } from 'vitest';
import {
  countDecimals,
  addDecimals,
  subDecimals,
  multiplyDecimals,
  divideDecimals,
  divideDecimalsWithRemainder,
  roundDecimal,
  ceilDecimal,
  floorDecimal,
  areDecimalsEqual,
} from '../src/domain/math/core/decimal';

describe('소수(Decimal) 코어 수학 엔진 단위 테스트', () => {
  describe('소수점 자릿수 카운팅', () => {
    it('소수점 이하 자릿수를 정확히 반환해야 함', () => {
      expect(countDecimals(1.25)).toBe(2);
      expect(countDecimals(3.14159)).toBe(5);
      expect(countDecimals(42)).toBe(0);
      expect(countDecimals(0.5)).toBe(1);
    });
  });

  describe('부동소수점 오차 없는 소수 연산 (Zero-Error Floating Point)', () => {
    it('0.1 + 0.2 연산 시 0.30000000000000004 오차가 발생하지 않아야 함', () => {
      expect(addDecimals(0.1, 0.2)).toBe(0.3);
      expect(addDecimals(1.25, 0.8)).toBe(2.05);
      expect(addDecimals(0.007, 0.003)).toBe(0.01);
    });

    it('소수 뺄셈 시 오차가 발생하지 않아야 함', () => {
      expect(subDecimals(1.5, 0.7)).toBe(0.8);
      expect(subDecimals(3.05, 1.25)).toBe(1.8);
      expect(subDecimals(0.3, 0.1)).toBe(0.2);
    });

    it('소수 곱셈 시 자릿수 확장이 정확해야 함', () => {
      // 0.4 * 0.7 = 0.28
      expect(multiplyDecimals(0.4, 0.7)).toBe(0.28);
      // 1.25 * 0.8 = 1
      expect(multiplyDecimals(1.25, 0.8)).toBe(1);
      // 2.5 * 1.4 = 3.5
      expect(multiplyDecimals(2.5, 1.4)).toBe(3.5);
    });

    it('소수 나눗셈을 정확히 계산해야 함', () => {
      expect(divideDecimals(7.2, 0.8)).toBe(9);
      expect(divideDecimals(4.8, 1.2)).toBe(4);
      expect(divideDecimals(9.18, 3)).toBe(3.06);
    });
  });

  describe('초등 6학년 소수 나눗셈의 자연수 몫과 소수 나머지(Remainder)', () => {
    it('7.5 ÷ 2 의 몫 3, 나머지 1.5를 정확히 계산해야 함 (2 × 3 + 1.5 = 7.5)', () => {
      const res = divideDecimalsWithRemainder(7.5, 2);
      expect(res.quotient).toBe(3);
      expect(res.remainder).toBe(1.5);
    });

    it('14.8 ÷ 4 의 몫 3, 나머지 2.8을 정확히 계산해야 함', () => {
      const res = divideDecimalsWithRemainder(14.8, 4);
      expect(res.quotient).toBe(3);
      expect(res.remainder).toBe(2.8);
    });

    it('딱 나누어떨어지는 경우 나머지는 0이어야 함', () => {
      const res = divideDecimalsWithRemainder(12.6, 3);
      expect(res.quotient).toBe(4);
      expect(res.remainder).toBe(0.6);
    });
  });

  describe('어림하기 (반올림, 올림, 버림)', () => {
    it('소수 자리수 반올림을 정확히 수행해야 함', () => {
      expect(roundDecimal(3.14159, 2)).toBe(3.14);
      expect(roundDecimal(3.14159, 3)).toBe(3.142);
      expect(roundDecimal(345, -1)).toBe(350); // 십의 자리까지
      expect(roundDecimal(1850, -2)).toBe(1900); // 백의 자리까지
    });

    it('올림 및 버림을 정확히 수행해야 함', () => {
      expect(ceilDecimal(3.12, 1)).toBe(3.2);
      expect(floorDecimal(3.18, 1)).toBe(3.1);
    });

    it('동일 소수 판별 함수가 안전하게 동작해야 함', () => {
      expect(areDecimalsEqual(0.1 + 0.2, 0.3)).toBe(true);
    });
  });
});
