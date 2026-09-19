import { describe, it, expect } from 'vitest';
import { generateWorksheet } from '../src/domain/math/generators/engine';
import { WorksheetRule } from '../src/domain/math/types';
import { GRADE_PRESETS } from '../src/domain/math/presets';
import { resolveRuleTitle } from '../src/domain/math/ruleTitle';
import { makeProblemKey } from '../src/domain/math/generators/utils';
import { isThreeOperandsSupported } from '../src/domain/math/generators/threeOperandsGenerator';
import { useWorksheetStore } from '@/stores/worksheetStore';

describe('세 수의 사칙연산 연산 엔진 무결점 검증 (Three Operands Engine)', () => {
  it('세 수의 덧셈 (A + B + C) 정답 계산 및 속성 검증', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '세 수의 덧셈',
      operations: ['addition'],
      category: 'arithmetic',
      operandCount: 3,
      count: 20,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      operandC: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
    };

    const result = generateWorksheet(rule);
    expect(result.success).toBe(true);
    expect(result.problems.length).toBe(20);

    result.problems.forEach((p) => {
      expect(p.operandC).toBeDefined();
      expect(p.operation).toBe('addition');
      expect(p.operation2).toBe('addition');
      expect(p.answer).toBe(p.operandA + p.operandB + p.operandC!);
    });
  });

  it('세 수의 뺄셈 (A - B - C) 중간값 및 최종값 음수 방지 검증', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '세 수의 뺄셈',
      operations: ['subtraction'],
      category: 'arithmetic',
      operandCount: 3,
      count: 20,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      operandC: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
    };

    const result = generateWorksheet(rule);
    expect(result.success).toBe(true);

    result.problems.forEach((p) => {
      expect(p.operandC).toBeDefined();
      expect(p.operation).toBe('subtraction');
      expect(p.operation2).toBe('subtraction');
      // 초등 수학 규칙: 중간 뺄셈 결과 >= 0
      expect(p.operandA - p.operandB).toBeGreaterThanOrEqual(0);
      // 최종 결과 >= 0
      expect(p.answer).toBeGreaterThanOrEqual(0);
      expect(p.answer).toBe(p.operandA - p.operandB - p.operandC!);
    });
  });

  it('세 수의 덧셈/뺄셈 혼합 (A + B - C 또는 A - B + C) 정합성 검증', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '세 수의 덧셈과 뺄셈',
      operations: ['addition', 'subtraction'],
      category: 'arithmetic',
      operandCount: 3,
      count: 30,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      operandC: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
    };

    const result = generateWorksheet(rule);
    expect(result.success).toBe(true);

    result.problems.forEach((p) => {
      expect(p.operandC).toBeDefined();
      expect(['addition', 'subtraction']).toContain(p.operation);
      expect(['addition', 'subtraction']).toContain(p.operation2);

      // 단계별 계산 및 음수 방지 검증
      const step1 = p.operation === 'addition' ? p.operandA + p.operandB : p.operandA - p.operandB;
      expect(step1).toBeGreaterThanOrEqual(0);

      const step2 = p.operation2 === 'addition' ? step1 + p.operandC! : step1 - p.operandC!;
      expect(step2).toBeGreaterThanOrEqual(0);
      expect(p.answer).toBe(step2);
    });
  });

  it('세 수의 곱셈 (A × B × C) 정답 계산 검증', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '세 수의 곱셈',
      operations: ['multiplication'],
      category: 'arithmetic',
      operandCount: 3,
      count: 20,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      operandC: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
    };

    const result = generateWorksheet(rule);
    expect(result.success).toBe(true);

    result.problems.forEach((p) => {
      expect(p.operandC).toBeDefined();
      expect(p.operation).toBe('multiplication');
      expect(p.operation2).toBe('multiplication');
      expect(p.answer).toBe(p.operandA * p.operandB * p.operandC!);
    });
  });

  it('세 수의 나눗셈 (A ÷ B ÷ C) 정수 나누어떨어짐 및 0 나누기 방지 검증', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '세 수의 나눗셈',
      operations: ['division'],
      category: 'arithmetic',
      operandCount: 3,
      count: 20,
      operandA: { digits: [2] },
      operandB: { digits: [1] },
      operandC: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
    };

    const result = generateWorksheet(rule);
    expect(result.success).toBe(true);

    result.problems.forEach((p) => {
      expect(p.operandC).toBeDefined();
      expect(p.operandB).toBeGreaterThan(0);
      expect(p.operandC!).toBeGreaterThan(0);
      expect(p.operandA % p.operandB).toBe(0);
      const intermediate = p.operandA / p.operandB;
      expect(intermediate % p.operandC!).toBe(0);
      expect(p.answer).toBe(intermediate / p.operandC!);
    });
  });

  it('세 수의 교환법칙 중복 키(makeProblemKey) 방지 검증', () => {
    // 1 + 2 + 3 과 3 + 1 + 2 는 교환법칙 모드에서 동일한 키 생성
    const key1 = makeProblemKey('addition', 1, 2, 'commutative', undefined, 3, 'addition');
    const key2 = makeProblemKey('addition', 3, 1, 'commutative', undefined, 2, 'addition');
    expect(key1).toBe(key2);

    // 2 * 3 * 4 와 4 * 2 * 3 도 교환법칙 모드에서 동일한 키 생성
    const mulKey1 = makeProblemKey('multiplication', 2, 3, 'commutative', undefined, 4, 'multiplication');
    const mulKey2 = makeProblemKey('multiplication', 4, 2, 'commutative', undefined, 3, 'multiplication');
    expect(mulKey1).toBe(mulKey2);
  });

  it('초1 2학기 공식 프리셋(g1-three-numbers-add-sub) 정상 동작 검증', () => {
    const preset = GRADE_PRESETS.find((p) => p.id === 'g1-three-numbers-add-sub');
    expect(preset).toBeDefined();
    expect(preset?.semesterLabel).toBe('초1(2학기)');
    expect(preset?.rule.operandCount).toBe(3);

    const result = generateWorksheet(preset!.rule);
    expect(result.success).toBe(true);
    expect(result.problems.length).toBe(preset!.rule.count);

    const title = resolveRuleTitle(preset!.rule);
    expect(title).toContain('세 수');
  });

  it('세 수 연산 대규모 퍼징(Fuzz Testing) 500문항 무결점 검증', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '세 수 퍼즈 테스트',
      operations: ['addition', 'subtraction'],
      category: 'arithmetic',
      operandCount: 3,
      count: 50,
      operandA: { digits: [1, 2] },
      operandB: { digits: [1] },
      operandC: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'horizontal',
      showFirstExample: true,
    };

    for (let loop = 0; loop < 10; loop++) {
      const res = generateWorksheet(rule);
      expect(res.success).toBe(true);
      res.problems.forEach((p) => {
        expect(p.operandC).toBeDefined();
        expect(p.operation2).toBeDefined();
        expect(Number.isFinite(p.answer)).toBe(true);
        expect(isNaN(p.answer)).toBe(false);
        expect(p.answer).toBeGreaterThanOrEqual(0);
      });
    }
  });

  it('세 수 연산에서 세로셈(vertical) 출제 시 뺄셈/혼합 포함 전 문항이 세로셈(vertical)으로 생성되어야 함 (가로셈 혼합 방지)', () => {
    const rule: WorksheetRule = {
      schemaVersion: 1,
      title: '세 수의 세로셈 덧셈·뺄셈',
      operations: ['addition', 'subtraction'],
      category: 'arithmetic',
      operandCount: 3,
      count: 30,
      operandA: { digits: [1] },
      operandB: { digits: [1] },
      operandC: { digits: [1] },
      carryCondition: 'any',
      borrowCondition: 'any',
      divisionCondition: 'none',
      allowNegative: false,
      allowZero: false,
      uniqueMode: 'exact',
      displayFormat: 'vertical',
      showFirstExample: true,
    };

    const res = generateWorksheet(rule);
    expect(res.success).toBe(true);
    expect(res.problems.length).toBe(30);

    // 단 한 문항도 가로셈으로 강제 전환되거나 혼합되지 않아야 함
    res.problems.forEach((p) => {
      expect(p.displayFormat).toBe('vertical');
    });
  });

  describe('학년별 세 수 연산 지원 여부(isThreeOperandsSupported) 및 비활성화 무결점 검증', () => {
    it('1~4학년 기본 자연수 사칙연산 프리셋은 세 수 연산을 지원(true)해야 함', () => {
      const supportedPresetIds = [
        'g1-add-sub-basic',
        'g1-add-sub-no-carry-vertical',
        'g1-three-numbers-add-sub',
        'g2-add-carry-once',
        'g2-sub-borrow-once',
        'g2-add-sub-mastery',
        'g3-add-sub-three-digits',
        'g3-multiplication-basic',
        'g3-division-exact',
        'g3-division-remainder',
        'g3-multiplication-advanced',
        'g4-multi-digits-mult-div',
      ];

      supportedPresetIds.forEach((id) => {
        const preset = GRADE_PRESETS.find((p) => p.id === id);
        expect(preset, `프리셋 ${id} 존재해야 함`).toBeDefined();
        expect(isThreeOperandsSupported(preset!.rule), `${id}는 세 수 연산을 지원해야 함`).toBe(true);
      });
    });

    it('곱셈구구, 분수, 소수, 혼합계산, 비례식, 약수와배수 프리셋은 세 수 연산을 미지원(false)해야 함', () => {
      const unsupportedPresetIds = [
        'g2-multiplication-table', // 2학년 곱셈구구 (2단~9단)
        'g4-frac-same-denom', // 4학년 분수
        'g4-decimal-add-sub', // 4학년 소수
        'g5-mixed-ops-basic', // 5학년 혼합 계산
        'g5-mixed-ops-paren', // 5학년 괄호 혼합 계산
        'g5-factors-gcd-lcm', // 5학년 최대공약수/최소공배수
        'g5-frac-diff-denom-add', // 5학년 분수 덧셈
        'g5-frac-diff-denom-sub', // 5학년 분수 뺄셈
        'g5-frac-multiplication', // 5학년 분수 곱셈
        'g5-decimal-multiplication', // 5학년 소수 곱셈
        'g6-frac-division-basic', // 6학년 분수 나눗셈
        'g6-decimal-division-quotient', // 6학년 소수 나눗셈
        'g6-percentage-calculation', // 6학년 백분율
        'g6-frac-division-advanced', // 6학년 역수 곱셈
        'g6-decimal-division-remainder', // 6학년 소수 몫과 나머지
        'g6-simplest-ratio', // 6학년 자연수 비
        'g6-proportion-solve', // 6학년 비례식
        'g6-all-round-challenge', // 6학년 혼합 심화
      ];

      unsupportedPresetIds.forEach((id) => {
        const preset = GRADE_PRESETS.find((p) => p.id === id);
        expect(preset, `프리셋 ${id} 존재해야 함`).toBeDefined();
        expect(isThreeOperandsSupported(preset!.rule), `${id}는 세 수 연산이 비활성화(미지원)되어야 함`).toBe(false);
      });
    });

    it('미지원 규칙(예: 분수)에서 setRule로 operandCount를 3으로 설정하려 해도 2로 강제 유지되어야 함', () => {
      const fracPreset = GRADE_PRESETS.find((p) => p.id === 'g5-frac-diff-denom-add');
      expect(fracPreset).toBeDefined();

      useWorksheetStore.getState().loadPreset('g5-frac-diff-denom-add');
      const currentRule = useWorksheetStore.getState().currentRule;
      expect(currentRule.operandCount ?? 2).toBe(2);

      // 의도적으로 세 수 연산(3) 설정을 시도
      useWorksheetStore.getState().setRule({ operandCount: 3 });
      const updatedRule = useWorksheetStore.getState().currentRule;
      // 미지원 규칙이므로 2로 유지되어야 함
      expect(updatedRule.operandCount).toBe(2);
    });

    it('세 수의 연산에서 곱셈/나눗셈 또는 연산자 혼합 시 세로셈(vertical) 규칙이어도 가로셈(horizontal)으로 강제되어야 함', () => {
      const mixedThreeRule: WorksheetRule = {
        schemaVersion: 1,
        title: '세 수의 사칙연산 혼합',
        operations: ['addition', 'multiplication'],
        operandCount: 3,
        count: 20,
        operandA: { digits: [1] },
        operandB: { digits: [1] },
        operandC: { digits: [1] },
        carryCondition: 'any',
        borrowCondition: 'any',
        divisionCondition: 'none',
        allowNegative: false,
        allowZero: false,
        uniqueMode: 'exact',
        displayFormat: 'vertical', // 세로셈 지정
        showFirstExample: true,
      };

      const result = generateWorksheet(mixedThreeRule);
      expect(result.success).toBe(true);

      result.problems.forEach((p) => {
        const isPureAdd = p.operation === 'addition' && p.operation2 === 'addition';
        if (!isPureAdd) {
          // 곱셈이 포함되거나 혼합된 경우 반드시 가로셈이어야 함
          expect(p.displayFormat).toBe('horizontal');
        }
      });
    });
  });
});

