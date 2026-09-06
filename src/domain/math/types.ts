/**
 * MathLab Kids - 대한민국 2022 개정 초등 교육과정 기준 수학 연산 도메인 타입 정의
 */

export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

export type DisplayFormat = 'horizontal' | 'vertical' | 'mixed';

export type CarryCondition = 'any' | 'none' | 'once' | 'twice' | 'more';
// any: 제한 없음, none: 받아올림 없음, once: 받아올림 한 번, twice: 받아올림 두 번, more: 세 번 이상

export type BorrowCondition = 'any' | 'none' | 'once' | 'twice' | 'continuous';
// any: 제한 없음, none: 받아내림 없음, once: 받아내림 한 번, twice: 받아내림 두 번, continuous: 연속 받아내림 포함

export type DivisionRemainderCondition = 'none' | 'required' | 'mixed';
// none: 나머지가 없는 나눗셈, required: 나머지가 있는 나눗셈, mixed: 둘 다 섞기

export type UniqueMode = 'exact' | 'commutative';
// exact: 완전 중복만 금지 (23+5 != 5+23), commutative: 교환 중복 금지 (3x7 == 7x3 동일 취급)

export interface NumberOperandRule {
  digits: number[]; // 허용 자릿수 목록 [1], [2], [1, 2], [3] 등 (1자리: 1~9, 2자리: 10~99, 3자리: 100~999, 4자리: 1000~9999)
  min?: number;
  max?: number;
  allowZeroEnding?: boolean; // 일의 자리가 0인 수 허용 여부 (기본 true)
}

export interface MultiplicationRule {
  minDan?: number; // 기본 2
  maxDan?: number; // 기본 9
  specificDans?: number[]; // 특정 단 선택 (예: [2, 3, 5])
  includeZeroOne?: boolean; // 0단, 1단 포함 여부
  allowReverseCommutative?: boolean; // 뒤집은 문제 허용 여부
  multiplicationCarry?: 'any' | 'none' | 'required'; // 곱셈 받아올림 여부
}

export interface WorksheetRule {
  schemaVersion: number;
  title: string;
  operations: Operation[];
  count: number; // 문제 수 (기본 20)
  operandA: NumberOperandRule;
  operandB: NumberOperandRule;
  carryCondition: CarryCondition;
  borrowCondition: BorrowCondition;
  divisionCondition: DivisionRemainderCondition;
  multiplicationRule?: MultiplicationRule;
  resultMin?: number;
  resultMax?: number;
  allowNegative: boolean; // 음수 허용 여부 (초등 기본 false)
  allowZero: boolean; // 피연산자에 0 허용 여부 (기본 false)
  uniqueMode: UniqueMode;
  displayFormat: DisplayFormat;
  showFirstExample: boolean; // 첫 번째 문제에 정답 예시 표시
}

export interface Problem {
  id: string;
  index: number; // 1부터 시작하는 문제 번호
  operation: Operation;
  operandA: number;
  operandB: number;
  answer: number; // 덧셈/뺄셈/곱셈의 값 또는 나눗셈의 몫(quotient)
  remainder?: number; // 나눗셈의 나머지
  carries?: number; // 받아올림 횟수
  borrows?: number; // 받아내림 횟수
  isExample?: boolean; // 첫 문제 정답 예시 여부
  displayFormat: 'horizontal' | 'vertical';
}

export interface UserAnswer {
  problemId: string;
  answer: number | null;
  remainder?: number | null;
  isCorrect?: boolean;
  timeSpentMs?: number;
  submittedAt?: string;
  firstAttemptCorrect?: boolean;
}

export interface SessionResult {
  id: string;
  title: string;
  createdAt: string;
  totalCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracyRate: number; // 0 ~ 100
  totalTimeSpentMs: number;
  averageTimeSpentMs: number;
  problems: Problem[];
  userAnswers: Record<string, UserAnswer>;
  rule: WorksheetRule;
}
