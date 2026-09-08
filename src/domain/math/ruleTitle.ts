import { WorksheetRule } from './types';
import { GRADE_PRESETS } from './presets';

/**
 * 주어진 규칙이 공식 학년별 프리셋 규칙과 일치하는지 엄격하게 판별합니다.
 */
export function matchesPreset(rule: WorksheetRule, presetRule: WorksheetRule): boolean {
  // 1. 프리셋 제목이 둘 다 명시되어 있는데 서로 다르면 다른 프리셋으로 즉시 판정
  if (rule.title && presetRule.title && rule.title !== presetRule.title) {
    return false;
  }

  // 2. 카테고리 비교 (fraction, decimal, mixed_operation, proportion, factors_multiples, arithmetic 등)
  const cat1 = rule.category || 'arithmetic';
  const cat2 = presetRule.category || 'arithmetic';
  if (cat1 !== cat2) return false;

  // 3. 보기 방식 (가로셈 / 세로셈)
  if (rule.displayFormat !== presetRule.displayFormat) return false;

  // 4. 연산 종류 비교
  if (rule.operations.length !== presetRule.operations.length) return false;
  const sortedOps1 = [...rule.operations].sort();
  const sortedOps2 = [...presetRule.operations].sort();
  if (sortedOps1.some((op, i) => op !== sortedOps2[i])) return false;

  // 5. 카테고리별 세부 규칙 비교
  if (cat1 === 'fraction') {
    const fr1 = rule.fractionRule;
    const fr2 = presetRule.fractionRule;
    if (!fr1 || !fr2) return fr1 === fr2;
    if (fr1.type !== fr2.type) return false;
    if (Boolean(fr1.allowMixed) !== Boolean(fr2.allowMixed)) return false;
    if (Boolean(fr1.sameDenominator) !== Boolean(fr2.sameDenominator)) return false;
    if ((fr1.maxDenominator ?? 12) !== (fr2.maxDenominator ?? 12)) return false;
    return true;
  }

  if (cat1 === 'mixed_operation') {
    const mr1 = rule.mixedOpRule;
    const mr2 = presetRule.mixedOpRule;
    if (!mr1 || !mr2) return mr1 === mr2;
    if (Boolean(mr1.hasParentheses) !== Boolean(mr2.hasParentheses)) return false;
    if (mr1.opCount !== mr2.opCount) return false;
    return true;
  }

  if (cat1 === 'proportion') {
    const pr1 = rule.proportionRule;
    const pr2 = presetRule.proportionRule;
    if (!pr1 || !pr2) return pr1 === pr2;
    if (pr1.type !== pr2.type) return false;
    return true;
  }

  if (cat1 === 'factors_multiples') {
    const f1 = rule.factorRule;
    const f2 = presetRule.factorRule;
    if (!f1 || !f2) return f1 === f2;
    if (f1.type !== f2.type) return false;
    if ((f1.maxNumber ?? 50) !== (f2.maxNumber ?? 50)) return false;
    return true;
  }

  if (cat1 === 'decimal') {
    const dr1 = rule.decimalRule;
    const dr2 = presetRule.decimalRule;
    if (!dr1 || !dr2) return dr1 === dr2;
    if (Boolean(dr1.isDivisionWithRemainder) !== Boolean(dr2.isDivisionWithRemainder)) return false;
    const dpA1 = [...(dr1.decimalPlacesA || [])].sort().join(',');
    const dpA2 = [...(dr2.decimalPlacesA || [])].sort().join(',');
    if (dpA1 !== dpA2) return false;
    const dpB1 = [...(dr1.decimalPlacesB || [])].sort().join(',');
    const dpB2 = [...(dr2.decimalPlacesB || [])].sort().join(',');
    if (dpB1 !== dpB2) return false;
    if (dr1.roundPlaces !== dr2.roundPlaces) return false;
    return true;
  }

  // 6. 곱셈구구 세부 규칙 비교
  if (rule.multiplicationRule || presetRule.multiplicationRule) {
    const m1 = rule.multiplicationRule;
    const m2 = presetRule.multiplicationRule;
    if (!m1 || !m2) return false;
    if ((m1.minDan ?? 2) !== (m2.minDan ?? 2)) return false;
    if ((m1.maxDan ?? 9) !== (m2.maxDan ?? 9)) return false;
    if (m1.multiplicationCarry !== m2.multiplicationCarry) return false;
  }

  // 7. 일반 사칙연산 자릿수 비교
  const digitsA1 = [...rule.operandA.digits].sort().join(',');
  const digitsA2 = [...presetRule.operandA.digits].sort().join(',');
  if (digitsA1 !== digitsA2) return false;

  const digitsB1 = [...rule.operandB.digits].sort().join(',');
  const digitsB2 = [...presetRule.operandB.digits].sort().join(',');
  if (digitsB1 !== digitsB2) return false;

  // 8. 받아올림/받아내림/나눗셈 조건
  if (rule.carryCondition !== presetRule.carryCondition) return false;
  if (rule.borrowCondition !== presetRule.borrowCondition) return false;
  if (rule.divisionCondition !== presetRule.divisionCondition) return false;

  return true;
}

/**
 * 일치하는 프리셋 찾기
 */
export function findMatchingPreset(rule: WorksheetRule) {
  return GRADE_PRESETS.find((p) => matchesPreset(rule, p.rule));
}

/**
 * 규칙에 맞는 정확하고 일관된 한글 제목을 동적으로 생성합니다.
 */
export function resolveRuleTitle(rule: WorksheetRule): string {
  const matched = findMatchingPreset(rule);
  if (matched) {
    return matched.title;
  }

  const formatDigits = (digits: number[]): string => {
    const sorted = [...digits].sort((a, b) => a - b);
    const map: Record<number, string> = {
      1: '한 자리',
      2: '두 자리',
      3: '세 자리',
      4: '네 자리',
    };
    if (sorted.length === 1) {
      return map[sorted[0]] || `${sorted[0]}자리`;
    }
    return sorted.map((d) => map[d] || `${d}자리`).join('·');
  };

  const digitsA = formatDigits(rule.operandA.digits);
  const digitsB = formatDigits(rule.operandB.digits);

  let digitsText = '';
  if (digitsA === digitsB) {
    digitsText = `${digitsA} 수의`;
  } else {
    digitsText = `${digitsA} 수와 ${digitsB} 수의`;
  }

  let opText = '';
  const ops = rule.operations;
  if (ops.length === 4) {
    opText = '사칙연산 혼합';
  } else if (ops.length === 0) {
    opText = '연산';
  } else {
    const opMap: Record<string, string> = {
      addition: '덧셈',
      subtraction: '뺄셈',
      multiplication: '곱셈',
      division: '나눗셈',
    };
    opText = ops.map((o) => opMap[o] || o).join('과 ');
  }

  let conditionText = '';
  if (ops.length === 1) {
    if (ops[0] === 'addition') {
      if (rule.carryCondition === 'once') conditionText = ' (받아올림 한 번)';
      else if (rule.carryCondition === 'twice') conditionText = ' (받아올림 두 번)';
      else if (rule.carryCondition === 'none') conditionText = ' (받아올림 없음)';
      else if (rule.carryCondition === 'more') conditionText = ' (받아올림 여러 번)';
    } else if (ops[0] === 'subtraction') {
      if (rule.borrowCondition === 'once') conditionText = ' (받아내림 한 번)';
      else if (rule.borrowCondition === 'twice') conditionText = ' (받아내림 두 번)';
      else if (rule.borrowCondition === 'none') conditionText = ' (받아내림 없음)';
      else if (rule.borrowCondition === 'continuous') conditionText = ' (연속 받아내림)';
    } else if (ops[0] === 'division') {
      if (rule.divisionCondition === 'none') conditionText = ' (나머지 없음)';
      else if (rule.divisionCondition === 'required') conditionText = ' (나머지 있음)';
    }
  }

  return `${digitsText} ${opText}${conditionText}`;
}
