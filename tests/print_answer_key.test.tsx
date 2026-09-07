import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { PrintAnswerKey } from '../src/components/print/PrintAnswerKey';
import { PrintWorksheet } from '../src/components/print/PrintWorksheet';
import { useWorksheetStore } from '../src/stores/worksheetStore';
import { Problem, WorksheetRule } from '../src/domain/math/types';

const dummyRule: WorksheetRule = {
  schemaVersion: 1,
  title: '두 자리 수 덧셈',
  operations: ['addition'],
  count: 32,
  operandA: { digits: [2] },
  operandB: { digits: [2] },
  carryCondition: 'none',
  borrowCondition: 'none',
  divisionCondition: 'none',
  allowNegative: false,
  allowZero: false,
  uniqueMode: 'exact',
  displayFormat: 'vertical',
  showFirstExample: false,
};

const dummyProblems: Problem[] = Array.from({ length: 32 }, (_, i) => ({
  id: `prob-${i + 1}`,
  index: i + 1,
  operation: i === 5 ? 'division' : 'addition',
  operandA: 10 + i,
  operandB: 5,
  answer: 15 + i,
  remainder: i === 5 ? 2 : undefined,
  displayFormat: 'vertical',
}));

describe('PrintAnswerKey 빠른 정답표 인쇄 컴포넌트 테스트', () => {
  it('기본 설정 시 15열 그리드로 렌더링되어야 함 (repeat(15, minmax(0, 1fr)))', () => {
    const html = renderToString(<PrintAnswerKey rule={dummyRule} problems={dummyProblems} />);
    
    expect(html).toContain('grid-cols-15');
    expect(html).toContain('grid-template-columns:repeat(15, minmax(0, 1fr))');
  });

  it('32문항의 문제 번호와 정답이 모두 누락 없이 렌더링되어야 함', () => {
    const html = renderToString(<PrintAnswerKey rule={dummyRule} problems={dummyProblems} />);
    
    expect(html).toMatch(/\[(?:<!-- -->)?1(?:<!-- -->)?\]/);
    expect(html).toMatch(/\[(?:<!-- -->)?15(?:<!-- -->)?\]/);
    expect(html).toMatch(/\[(?:<!-- -->)?16(?:<!-- -->)?\]/);
    expect(html).toMatch(/\[(?:<!-- -->)?32(?:<!-- -->)?\]/);
    
    expect(html).toContain('16');
    expect(html).toMatch(/…(?:<!-- -->)?2/);
  });

  it('문제 번호 영역이 고정 최소 너비(min-w-[20px]) 및 tabular-nums를 가져 종방향 정렬이 유지되어야 함', () => {
    const html = renderToString(<PrintAnswerKey rule={dummyRule} problems={dummyProblems} />);
    
    expect(html).toContain('min-w-[20px]');
    expect(html).toContain('tabular-nums');
  });

  it('사용자 지정 columns 인자가 전달되면 해당 열 수로 그리드가 구성되어야 함', () => {
    const html = renderToString(<PrintAnswerKey rule={dummyRule} problems={dummyProblems} columns={10} />);
    
    expect(html).toContain('grid-template-columns:repeat(10, minmax(0, 1fr))');
  });

  it('절취선(가위 컷팅 가이드 라인)이 기본적으로 렌더링되어야 함', () => {
    const html = renderToString(<PrintAnswerKey rule={dummyRule} problems={dummyProblems} showCutLine={true} />);
    
    expect(html).toContain('절취선');
    expect(html).toContain('border-dashed');
  });

  it('다중 매수 인쇄 시에도 정답표와 학습지 헤더에 세트 번호가 노출되지 않아야 함 (깔끔한 인쇄용)', () => {
    const answerHtml = renderToString(
      <PrintAnswerKey rule={dummyRule} problems={dummyProblems} sheetIndex={2} totalSheets={3} />
    );
    expect(answerHtml).not.toContain('세트 2');

    const worksheetHtml = renderToString(
      <PrintWorksheet rule={dummyRule} problems={dummyProblems} sheetIndex={2} totalSheets={3} />
    );
    expect(worksheetHtml).not.toContain('세트 2');
  });

  it('프린터 노즐 막힘 방지를 위한 3mm 레인보우 컬러 밴드가 렌더링되어야 함', () => {
    const html = renderToString(<PrintAnswerKey rule={dummyRule} problems={dummyProblems} />);
    
    expect(html).toContain('height:3mm');
    expect(html).toContain('linear-gradient');
    expect(html).toContain('print-color-adjust:exact');
  });
});

describe('인쇄 설정 스토어 상태 관리 테스트', () => {
  it('인쇄 설정(열 수, 정답지 여부, 압축 여부, 인쇄 매수)이 상태에 반영되어야 함', () => {
    const store = useWorksheetStore.getState();
    
    store.setPrintColumns(3);
    store.setPrintIncludeAnswerKey(true);
    store.setPrintIsCompact(false);
    store.setPrintSheetCount(5);

    store.setPrintFontScale(1.2);

    const updated = useWorksheetStore.getState();
    expect(updated.printColumns).toBe(3);
    expect(updated.printIncludeAnswerKey).toBe(true);
    expect(updated.printIsCompact).toBe(false);
    expect(updated.printSheetCount).toBe(5);
    expect(updated.printFontScale).toBe(1.2);

    // 경계값 테스트 (0.7 ~ 1.5 클램핑)
    store.setPrintFontScale(0.3);
    expect(useWorksheetStore.getState().printFontScale).toBe(0.7);

    store.setPrintFontScale(2.5);
    expect(useWorksheetStore.getState().printFontScale).toBe(1.5);
  });

  it('수식 글자 크기(fontScale) 변경 시 그리드 구조는 유지되고 수식 요소에만 transform scale이 적용되어야 함', () => {
    const defaultHtml = renderToString(
      <PrintWorksheet rule={dummyRule} problems={dummyProblems.slice(0, 10)} fontScale={1.0} />
    );
    // 기본 크기(1.0)일 때는 transform 미적용
    expect(defaultHtml).toContain('worksheet-grid');
    expect(defaultHtml).not.toContain('transform:scale(1)');

    const scaledHtml = renderToString(
      <PrintWorksheet rule={dummyRule} problems={dummyProblems.slice(0, 10)} fontScale={1.25} />
    );
    // 1.25배 확대 시: 그리드 클래스는 그대로 유지되고 내부 래퍼에 transform scale 적용
    expect(scaledHtml).toContain('worksheet-grid');
    expect(scaledHtml).toContain('transform:scale(1.25)');
    expect(scaledHtml).toContain('transform-origin:top center');
    expect(scaledHtml).toContain('data-font-scale="1.25"');
  });
});
