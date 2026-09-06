/**
 * 문제 생성 통합 엔진 (Worksheet Engine)
 * 여러 연산 혼합, 중복 제어, 예외 및 생성 한계 처리, 첫 문제 예시 처리를 총괄합니다.
 */
import { WorksheetRule, Problem, Operation } from '../types';
import { generateAdditionProblem } from './addition';
import { generateSubtractionProblem } from './subtraction';
import { generateMultiplicationProblem } from './multiplication';
import { generateDivisionProblem } from './division';
import { makeProblemKey, shuffle } from './utils';

export interface GenerationResult {
  success: boolean;
  problems: Problem[];
  errorMessage?: string;
}

export function generateWorksheet(rule: WorksheetRule): GenerationResult {
  if (!rule.operations || rule.operations.length === 0) {
    return {
      success: false,
      problems: [],
      errorMessage: '연산 종류를 하나 이상 선택해 주세요.',
    };
  }

  const totalCount = rule.count > 0 ? rule.count : 20;
  const problems: Problem[] = [];
  const seenKeys = new Set<string>();

  // 각 연산별 균등 분배 계산
  const opCount = rule.operations.length;
  const opAssignments: Operation[] = [];
  for (let i = 0; i < totalCount; i++) {
    opAssignments.push(rule.operations[i % opCount]);
  }
  const shuffledOps = shuffle(opAssignments);

  let consecutiveFailures = 0;
  const maxFailures = 500;

  for (let i = 0; i < totalCount; i++) {
    const op = shuffledOps[i];
    let created: Problem | null = null;
    let found = false;

    // 현재 문제 생성 시도 (최대 50회 시도)
    for (let attempt = 0; attempt < 50; attempt++) {
      switch (op) {
        case 'addition':
          created = generateAdditionProblem(rule, i + 1, false);
          break;
        case 'subtraction':
          created = generateSubtractionProblem(rule, i + 1, false);
          break;
        case 'multiplication':
          created = generateMultiplicationProblem(rule, i + 1, false);
          break;
        case 'division':
          created = generateDivisionProblem(rule, i + 1, false);
          break;
      }

      if (created) {
        const key = makeProblemKey(created.operation, created.operandA, created.operandB, rule.uniqueMode);
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          found = true;
          break;
        }
      }
    }

    if (found && created) {
      consecutiveFailures = 0;
      problems.push(created);
    } else {
      consecutiveFailures++;
      if (consecutiveFailures > 20) {
        // 중복 없이 생성할 수 있는 가능한 조합이 고갈된 경우
        break;
      }
    }
  }

  if (problems.length < Math.min(5, totalCount)) {
    return {
      success: false,
      problems,
      errorMessage: `현재 조건으로는 서로 다른 문제 ${totalCount}개를 만들기 어렵습니다. 문제 수를 줄이거나 조건을 조금 넓혀 주세요.`,
    };
  }

  // 첫 번째 문제 정답 예시 처리
  if (rule.showFirstExample && problems.length > 0) {
    problems[0].isExample = true;
  }

  return {
    success: true,
    problems,
  };
}
