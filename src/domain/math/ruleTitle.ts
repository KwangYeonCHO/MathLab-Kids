import { WorksheetRule } from './types';
import { GRADE_PRESETS } from './presets';

/**
 * 주어진 규칙이 공식 학년별 프리셋 규칙과 일치하는지 판별합니다.
 */
export function matchesPreset(rule: WorksheetRule, presetRule: WorksheetRule): boolean {
  if (rule.operations.length !== presetRule.operations.length) return false;
  const sortedOps1 = [...rule.operations].sort();
  const sortedOps2 = [...presetRule.operations].sort();
  if (sortedOps1.some((op, i) => op !== sortedOps2[i])) return false;

  const digitsA1 = [...rule.operandA.digits].sort().join(',');
  const digitsA2 = [...presetRule.operandA.digits].sort().join(',');
  if (digitsA1 !== digitsA2) return false;

  const digitsB1 = [...rule.operandB.digits].sort().join(',');
  const digitsB2 = [...presetRule.operandB.digits].sort().join(',');
  if (digitsB1 !== digitsB2) return false;

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
