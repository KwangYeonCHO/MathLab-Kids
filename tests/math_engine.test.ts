import { describe, it, expect } from 'vitest';
import { countCarries } from '../src/domain/math/analyzers/carry';
import { analyzeBorrows } from '../src/domain/math/analyzers/borrow';
import { generateAdditionProblem } from '../src/domain/math/generators/addition';
import { generateSubtractionProblem } from '../src/domain/math/generators/subtraction';
import { generateMultiplicationProblem } from '../src/domain/math/generators/multiplication';
import { generateDivisionProblem } from '../src/domain/math/generators/division';
import { generateWorksheet } from '../src/domain/math/generators/engine';
import { GRADE_PRESETS } from '../src/domain/math/presets';
import { WorksheetRule } from '../src/domain/math/types';
import { matchesPreset } from '../src/domain/math/ruleTitle';

describe('받아올림(Carry) 정밀 계산기 테스트', () => {
  it('받아올림이 없는 덧셈은 0을 반환해야 함', () => {
    expect(countCarries(23, 5)).toBe(0);
    expect(countCarries(12, 34)).toBe(0);
    expect(countCarries(100, 200)).toBe(0);
  });

  it('받아올림이 1회인 덧셈을 정확히 계산해야 함', () => {
    expect(countCarries(5, 7)).toBe(1);
    expect(countCarries(48, 5)).toBe(1);
    expect(countCarries(50, 50)).toBe(1);
  });

  it('받아올림이 2회 이상 연속으로 발생하는 경우를 정확히 계산해야 함', () => {
    expect(countCarries(99, 1)).toBe(2);
    expect(countCarries(859, 145)).toBe(3); // 9+5=14(1), 5+4+1=10(1), 8+1+1=10(1) -> 3회
    expect(countCarries(999, 1)).toBe(3);
  });
});

describe('받아내림(Borrow) 정밀 계산기 테스트', () => {
  it('받아내림이 없는 뺄셈은 0을 반환해야 함', () => {
    expect(analyzeBorrows(58, 23).count).toBe(0);
    expect(analyzeBorrows(95, 41).count).toBe(0);
  });

  it('받아내림이 1회인 뺄셈을 정확히 계산해야 함', () => {
    const res = analyzeBorrows(53, 18);
    expect(res.count).toBe(1);
    expect(res.hasContinuousBorrow).toBe(false);
  });

  it('0을 거치는 연속 받아내림을 감지해야 함', () => {
    const res = analyzeBorrows(502, 18);
    expect(res.count).toBe(1);
    expect(res.hasContinuousBorrow).toBe(true);
  });
});

describe('나눗셈 나머지 무결성 테스트', () => {
  it('나머지가 있는 나눗셈은 0 < 나머지 < 나누는 수 를 항상 만족해야 함', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '나눗셈 테스트',
      operations: ['division'],
      count: 20,
      operandA: { digits: [2] },
      operandB: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'required',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: false,
    };

    for (let i = 0; i < 100; i++) {
      const prob = generateDivisionProblem(rule, i + 1);
      expect(prob).not.toBeNull();
      if (prob) {
        expect(prob.remainder).toBeDefined();
        expect(prob.remainder!).toBeGreaterThan(0);
        expect(prob.remainder!).toBeLessThan(prob.operandB);
        expect(prob.operandA).toBe(prob.operandB * prob.answer + prob.remainder!);
      }
    }
  });
});

describe('학년별 프리셋 문제 생성 무결성 테스트', () => {
  GRADE_PRESETS.forEach((preset) => {
    it(`프리셋 "${preset.title}"은 규칙에 맞는 문제를 정상 생성해야 함`, () => {
      const result = generateWorksheet(preset.rule);
      expect(result.success).toBe(true);
      expect(result.problems.length).toBe(preset.rule.count);
      if (preset.rule.showFirstExample) {
        expect(result.problems[0].isExample).toBe(true);
      }
    });
  });
});

describe('10,000회 대량 무결성 스트레스 테스트 (매뉴얼 26.2)', () => {
  it('1만 회 연산 생성 동안 규칙 위반(받아올림/음수/나머지 불변식)이 0건이어야 함', () => {
    let violationCount = 0;

    // 1. 받아올림 0회 덧셈 2500회
    const noCarryRule: WorksheetRule = {
      schemaVersion: 1,
      title: '노캐리',
      operations: ['addition'],
      count: 10,
      operandA: { digits: [2] },
      operandB: { digits: [2] },
      carryCondition: 'none',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: false,
    };
    for (let i = 0; i < 2500; i++) {
      const p = generateAdditionProblem(noCarryRule, i);
      if (!p || countCarries(p.operandA, p.operandB) !== 0) {
        violationCount++;
      }
    }

    // 2. 받아내림 1회 뺄셈 2500회
    const borrowOnceRule: WorksheetRule = {
      schemaVersion: 1,
      title: '받아내림 1회',
      operations: ['subtraction'],
      count: 10,
      operandA: { digits: [2] },
      operandB: { digits: [1, 2] },
      carryCondition: 'any',
      borrowCondition: 'once',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: false,
    };
    for (let i = 0; i < 2500; i++) {
      const p = generateSubtractionProblem(borrowOnceRule, i);
      if (!p || p.answer < 0 || analyzeBorrows(p.operandA, p.operandB).count !== 1) {
        violationCount++;
      }
    }

    // 3. 곱셈구구 2500회
    const multRule: WorksheetRule = {
      schemaVersion: 1,
      title: '곱셈구구',
      operations: ['multiplication'],
      count: 10,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      multiplicationRule: { minDan: 2, maxDan: 9 },
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: false,
    };
    for (let i = 0; i < 2500; i++) {
      const p = generateMultiplicationProblem(multRule, i);
      if (!p || p.answer !== p.operandA * p.operandB) {
        violationCount++;
      }
    }

    // 4. 나머지 나눗셈 2500회
    const divRule: WorksheetRule = {
      schemaVersion: 1,
      title: '나머지 나눗셈',
      operations: ['division'],
      count: 10,
      operandA: { digits: [2] },
      operandB: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'required',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: false,
    };
    for (let i = 0; i < 2500; i++) {
      const p = generateDivisionProblem(divRule, i);
      if (
        !p ||
        p.remainder === undefined ||
        p.remainder <= 0 ||
        p.remainder >= p.operandB ||
        p.operandA !== p.operandB * p.answer + p.remainder
      ) {
        violationCount++;
      }
    }

    expect(violationCount).toBe(0);
  });

  describe('학년별 프리셋(GRADE_PRESETS) 전체 유효성 검증', () => {
    it('총 25개의 공식 프리셋이 모두 20문항을 오류 없이 정상 생성해야 함', () => {
      expect(GRADE_PRESETS.length).toBe(25);

      GRADE_PRESETS.forEach((preset) => {
        const result = generateWorksheet(preset.rule);
        expect(result.success).toBe(true);
        expect(result.problems.length).toBe(preset.rule.count);
      });
    });

    it('신규 초1 프리셋(g1-add-sub-no-carry-vertical)은 받아올림과 받아내림이 없어야 함', () => {
      const preset = GRADE_PRESETS.find((p) => p.id === 'g1-add-sub-no-carry-vertical');
      expect(preset).toBeDefined();
      expect(preset?.rule.displayFormat).toBe('vertical');
      expect(preset?.rule.operations).toEqual(['addition', 'subtraction']);

      const res = generateWorksheet(preset!.rule);
      expect(res.success).toBe(true);
      expect(res.problems.length).toBe(20);

      res.problems.forEach((prob) => {
        if (prob.operation === 'addition') {
          expect(countCarries(prob.operandA, prob.operandB)).toBe(0);
        } else if (prob.operation === 'subtraction') {
          expect(analyzeBorrows(prob.operandA, prob.operandB).count).toBe(0);
        }
      });
    });

    it('각 프리셋은 오직 자기 자신에게만 매칭되어야 하며 다중 선택(충돌)이 발생하지 않아야 함', () => {
      const collisions: string[] = [];
      for (let i = 0; i < GRADE_PRESETS.length; i++) {
        for (let j = 0; j < GRADE_PRESETS.length; j++) {
          if (i !== j) {
            const p1 = GRADE_PRESETS[i];
            const p2 = GRADE_PRESETS[j];
            if (matchesPreset(p1.rule, p2.rule)) {
              collisions.push(`[${p1.id}: ${p1.title}] collided with [${p2.id}: ${p2.title}]`);
            }
          }
        }
      }
      if (collisions.length > 0) {
        console.error('PRESET COLLISIONS DETECTED:', collisions);
      }
      expect(collisions).toEqual([]);
    });
  });
});
