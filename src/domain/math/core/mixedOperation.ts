/**
 * MathLab Kids - 자연수 혼합 계산(Order of Operations) 코어 라이브러리
 * 대한민국 2022 개정 초등 5학년 1학기 기준:
 * - 덧셈, 뺄셈, 곱셈, 나눗셈 및 괄호 ( ) 복합 수식 파싱 및 계산 순서 검증
 * - 교육과정 필수 제약 조건:
 *   1) 중간 및 최종 뺄셈 연산에서 절대 음수가 발생하지 않아야 함 (>= 0)
 *   2) 모든 나눗셈 연산은 나머지가 없이 나누어떨어져야 함 (A % B === 0)
 *   3) 0으로 나누기 절대 금지
 *   4) 괄호는 연산 순서를 바꾸는 유의미한 괄호여야 함 (잉여 괄호 방지)
 */

export type OpType = '+' | '−' | '×' | '÷';

export interface ExpressionStep {
  stepIndex: number;
  subExpression: string; // 예: "12 - 4"
  result: number;        // 예: 8
  fullExpressionAfter: string;
}

export interface EvaluatedExpression {
  expression: string;         // 표시용 수식 (예: "25 + (14 - 6) × 3")
  tokens: string[];
  answer: number;             // 최종 결과
  steps: ExpressionStep[];    // 연산 순서 단계별 풀이
  isValidElementary: boolean; // 초등 교육과정 제약 통과 여부
  errorMessage?: string;
}

/**
 * 표준 수식 문자열을 계산하고 초등 교육과정 규칙 준수 여부를 정밀 검증합니다.
 */
export function evaluateMixedExpression(expr: string): EvaluatedExpression {
  // 기호 정규화: '-' -> '−', '*' -> '×', '/' -> '÷'
  const normalized = expr
    .replace(/-/g, '−')
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .trim();

  // 토큰 분리 (정수, 연산자, 괄호)
  const tokenRegex = /(\d+|[+−×÷()])/g;
  const rawTokens = normalized.match(tokenRegex);

  if (!rawTokens || rawTokens.length === 0) {
    return {
      expression: normalized,
      tokens: [],
      answer: 0,
      steps: [],
      isValidElementary: false,
      errorMessage: '수식이 비어 있습니다.',
    };
  }

  // 연산자 우선순위
  // 괄호 안 우선 -> 곱셈/나눗셈 우선 -> 덧셈/뺄셈
  const steps: ExpressionStep[] = [];
  let currentTokens = [...rawTokens];
  let stepCounter = 1;

  // 1. 괄호 처리 루프
  while (currentTokens.includes('(')) {
    const openIndex = currentTokens.lastIndexOf('(');
    const closeIndex = currentTokens.indexOf(')', openIndex);

    if (closeIndex === -1) {
      return {
        expression: normalized,
        tokens: rawTokens,
        answer: 0,
        steps: [],
        isValidElementary: false,
        errorMessage: '괄호가 올바르게 닫히지 않았습니다.',
      };
    }

    const insideTokens = currentTokens.slice(openIndex + 1, closeIndex);
    const insideResult = evaluateSimpleTokens(insideTokens);

    if (!insideResult.isValid) {
      return {
        expression: normalized,
        tokens: rawTokens,
        answer: 0,
        steps: [],
        isValidElementary: false,
        errorMessage: insideResult.error,
      };
    }

    steps.push({
      stepIndex: stepCounter++,
      subExpression: insideTokens.join(' '),
      result: insideResult.val,
      fullExpressionAfter: '',
    });

    currentTokens.splice(openIndex, closeIndex - openIndex + 1, insideResult.val.toString());
  }

  // 2. 괄호 없는 수식 최종 계산
  const finalResult = evaluateSimpleTokens(currentTokens);
  if (!finalResult.isValid) {
    return {
      expression: normalized,
      tokens: rawTokens,
      answer: 0,
      steps,
      isValidElementary: false,
      errorMessage: finalResult.error,
    };
  }

  return {
    expression: normalized,
    tokens: rawTokens,
    answer: finalResult.val,
    steps,
    isValidElementary: true,
  };
}

/**
 * 괄호가 없는 토큰 배열을 사칙연산 우선순위(×, ÷ 우선 후 +, −)에 따라 계산합니다.
 */
function evaluateSimpleTokens(tokens: string[]): { val: number; isValid: boolean; error?: string } {
  let working = [...tokens];

  // 1단계: 곱셈과 나눗셈 순차 계산 (왼쪽에서 오른쪽으로)
  let i = 0;
  while (i < working.length) {
    const token = working[i];
    if (token === '×' || token === '÷') {
      const left = parseInt(working[i - 1], 10);
      const right = parseInt(working[i + 1], 10);

      if (isNaN(left) || isNaN(right)) {
        return { val: 0, isValid: false, error: '잘못된 피연산자입니다.' };
      }

      let res = 0;
      if (token === '×') {
        res = left * right;
      } else {
        if (right === 0) {
          return { val: 0, isValid: false, error: '0으로 나눌 수 없습니다.' };
        }
        if (left % right !== 0) {
          return {
            val: 0,
            isValid: false,
            error: `나머지가 발생하는 나눗셈(${left} ÷ ${right})은 초등 혼합계산에 적합하지 않습니다.`,
          };
        }
        res = left / right;
      }

      working.splice(i - 1, 3, res.toString());
      i = i - 1;
    } else {
      i++;
    }
  }

  // 2단계: 덧셈과 뺄셈 순차 계산 (왼쪽에서 오른쪽으로)
  i = 0;
  while (i < working.length) {
    const token = working[i];
    if (token === '+' || token === '−') {
      const left = parseInt(working[i - 1], 10);
      const right = parseInt(working[i + 1], 10);

      if (isNaN(left) || isNaN(right)) {
        return { val: 0, isValid: false, error: '잘못된 피연산자입니다.' };
      }

      let res = 0;
      if (token === '+') {
        res = left + right;
      } else {
        if (left < right) {
          return {
            val: 0,
            isValid: false,
            error: `중간 계산에서 음수(${left} − ${right})가 발생합니다.`,
          };
        }
        res = left - right;
      }

      working.splice(i - 1, 3, res.toString());
      i = i - 1;
    } else {
      i++;
    }
  }

  if (working.length !== 1) {
    return { val: 0, isValid: false, error: '수식 계산을 완료하지 못했습니다.' };
  }

  return { val: parseInt(working[0], 10), isValid: true };
}
