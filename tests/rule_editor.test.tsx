import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { RuleEditor } from '../src/components/rule-editor/RuleEditor';
import { GRADE_PRESETS } from '../src/domain/math/presets';

const mockState = {
  currentRule: GRADE_PRESETS.find((p) => p.id === 'g5-frac-diff-denom-add')!.rule,
  setRule: vi.fn(),
  resetRuleToDefault: vi.fn(),
  currentPresetId: 'g5-frac-diff-denom-add',
  loadPreset: vi.fn(),
  presetList: GRADE_PRESETS,
  operandCount: 2,
};

vi.mock('@/stores/worksheetStore', () => ({
  useWorksheetStore: Object.assign(
    vi.fn(() => mockState),
    {
      getState: () => mockState,
      setState: vi.fn(),
    }
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('RuleEditor 세 수 연산 선택 비활성화 UI 검증', () => {
  it('세 수 미지원 규칙(분수)인 경우 3개의 수 버튼이 disabled 처리되고 안내 배지가 렌더링되어야 함', () => {
    mockState.currentRule = GRADE_PRESETS.find((p) => p.id === 'g5-frac-diff-denom-add')!.rule;
    const html = renderToString(React.createElement(RuleEditor));
    expect(html).toContain('disabled=""');
    expect(html).toContain('미지원');
    expect(html).toContain('현재 문제 유형은 2개의 수만 지원');
  });

  it('세 수 미지원 규칙(곱셈구구)인 경우 3개의 수 버튼이 disabled 처리되어야 함', () => {
    mockState.currentRule = GRADE_PRESETS.find((p) => p.id === 'g2-multiplication-table')!.rule;
    const html = renderToString(React.createElement(RuleEditor));
    expect(html).toContain('disabled=""');
    expect(html).toContain('미지원');
    expect(html).toContain('현재 문제 유형은 2개의 수만 지원');
  });

  it('세 수 지원 규칙(1학년 덧셈·뺄셈)인 경우 3개의 수 버튼이 활성화(disabled 없음)되어야 함', () => {
    mockState.currentRule = GRADE_PRESETS.find((p) => p.id === 'g1-add-sub-basic')!.rule;
    const html = renderToString(React.createElement(RuleEditor));
    expect(html).not.toContain('disabled=""');
    expect(html).not.toContain('미지원');
    expect(html).not.toContain('현재 문제 유형은 2개의 수만 지원');
  });
});
