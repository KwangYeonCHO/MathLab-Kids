import { describe, it, expect } from 'vitest';
import { evaluateMixedExpression } from '../src/domain/math/core/mixedOperation';

describe('자연수 혼합 계산(Order of Operations) 코어 라이브러리 단위 테스트', () => {
  describe('연산자 우선순위 (곱셈/나눗셈 우선)', () => {
    it('곱셈이 덧셈/뺄셈보다 먼저 계산되어야 함', () => {
      // 25 + 4 * 3 = 25 + 12 = 37
      const res = evaluateMixedExpression('25 + 4 * 3');
      expect(res.isValidElementary).toBe(true);
      expect(res.answer).toBe(37);

      // 40 - 5 * 6 = 40 - 30 = 10
      const res2 = evaluateMixedExpression('40 - 5 * 6');
      expect(res2.isValidElementary).toBe(true);
      expect(res2.answer).toBe(10);
    });

    it('나눗셈이 덧셈/뺄셈보다 먼저 계산되어야 함', () => {
      // 50 - 24 / 4 + 7 = 50 - 6 + 7 = 44 + 7 = 51
      const res = evaluateMixedExpression('50 - 24 / 4 + 7');
      expect(res.isValidElementary).toBe(true);
      expect(res.answer).toBe(51);
    });

    it('곱셈과 나눗셈이 섞여있을 때 왼쪽에서 오른쪽으로 계산되어야 함', () => {
      // 36 / 6 * 4 = 6 * 4 = 24
      const res = evaluateMixedExpression('36 / 6 * 4');
      expect(res.isValidElementary).toBe(true);
      expect(res.answer).toBe(24);
    });
  });

  describe('괄호 ( ) 우선순위 처리', () => {
    it('괄호 안의 연산이 가장 먼저 계산되어야 함', () => {
      // (15 + 9) / 4 = 24 / 4 = 6
      const res = evaluateMixedExpression('(15 + 9) / 4');
      expect(res.isValidElementary).toBe(true);
      expect(res.answer).toBe(6);

      // 50 - (12 + 6 * 3) = 50 - (12 + 18) = 50 - 30 = 20
      const res2 = evaluateMixedExpression('50 - (12 + 6 * 3)');
      expect(res2.isValidElementary).toBe(true);
      expect(res2.answer).toBe(20);
    });
  });

  describe('초등 교육과정 제약 조건 검증 (음수 방지 및 나누어떨어짐)', () => {
    it('중간 계산 과정에서 음수가 발생하면 isValidElementary 가 false 여야 함', () => {
      // 20 - 30 + 15 -> 20 - 30 은 음수이므로 초등 교육과정 부적합
      const res = evaluateMixedExpression('20 - 30 + 15');
      expect(res.isValidElementary).toBe(false);
      expect(res.errorMessage).toContain('음수');
    });

    it('나눗셈에서 나머지가 발생하면 isValidElementary 가 false 여야 함', () => {
      // 25 / 4 + 3 -> 25 / 4 는 나머지가 남으므로 초등 자연수 혼합계산 부적합
      const res = evaluateMixedExpression('25 / 4 + 3');
      expect(res.isValidElementary).toBe(false);
      expect(res.errorMessage).toContain('나머지');
    });

    it('0으로 나누기는 엄격히 차단되어야 함', () => {
      const res = evaluateMixedExpression('12 / 0');
      expect(res.isValidElementary).toBe(false);
    });
  });
});
