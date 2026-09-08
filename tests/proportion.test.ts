import { describe, it, expect } from 'vitest';
import {
  simplifyRatio,
  solveProportion,
  proportionalDistribution,
  calculatePercentage,
} from '../src/domain/math/core/proportion';

describe('비와 비율 / 비례식(Ratio & Proportion) 코어 라이브러리 단위 테스트', () => {
  describe('가장 간단한 자연수의 비로 나타내기 (Simplest Ratio)', () => {
    it('자연수 비를 약분하여 가장 간단한 자연수의 비로 변환해야 함', () => {
      expect(simplifyRatio(12, 18)).toEqual({ antecedent: 2, consequent: 3 });
      expect(simplifyRatio(24, 36)).toEqual({ antecedent: 2, consequent: 3 });
      expect(simplifyRatio(35, 49)).toEqual({ antecedent: 5, consequent: 7 });
    });

    it('소수 비를 자연수의 비로 변환한 후 기약 형태로 약분해야 함', () => {
      expect(simplifyRatio(0.4, 0.6)).toEqual({ antecedent: 2, consequent: 3 });
      expect(simplifyRatio(1.5, 2.5)).toEqual({ antecedent: 3, consequent: 5 });
      expect(simplifyRatio(0.12, 0.18)).toEqual({ antecedent: 2, consequent: 3 });
    });
  });

  describe('비례식 미지항 구하기 (A : B = C : D)', () => {
    it('외항 D를 미지수로 두고 정확히 풀어야 함 (A × D = B × C)', () => {
      // 3 : 5 = 12 : □ -> □ = (5 * 12) / 3 = 20
      const res = solveProportion(3, 5, 12, null);
      expect(res.unknownPos).toBe('D');
      expect(res.value).toBe(20);
    });

    it('내항 C를 미지수로 두고 정확히 풀어야 함', () => {
      // 4 : 7 = □ : 35 -> □ = (4 * 35) / 7 = 20
      const res = solveProportion(4, 7, null, 35);
      expect(res.unknownPos).toBe('C');
      expect(res.value).toBe(20);
    });

    it('전항 A를 미지수로 두고 정확히 풀어야 함', () => {
      // □ : 6 = 15 : 18 -> □ = (6 * 15) / 18 = 5
      const res = solveProportion(null, 6, 15, 18);
      expect(res.unknownPos).toBe('A');
      expect(res.value).toBe(5);
    });
  });

  describe('비례배분 (Proportional Distribution)', () => {
    it('주어진 수량을 비에 맞추어 정확하게 배분해야 함', () => {
      // 300을 2 : 3 으로 배분 -> 120, 180
      const res = proportionalDistribution(300, 2, 3);
      expect(res.partA).toBe(120);
      expect(res.partB).toBe(180);
      expect(res.partA + res.partB).toBe(300);

      // 500을 3 : 7 로 배분 -> 150, 350
      const res2 = proportionalDistribution(500, 3, 7);
      expect(res2.partA).toBe(150);
      expect(res2.partB).toBe(350);
    });
  });

  describe('백분율(%) 계산', () => {
    it('비율을 백분율로 정확하게 계산해야 함', () => {
      expect(calculatePercentage(15, 60)).toBe(25);
      expect(calculatePercentage(3, 4)).toBe(75);
      expect(calculatePercentage(1, 8)).toBe(12.5);
    });
  });
});
