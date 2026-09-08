'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';

/**
 * 공통 A4 용지 컴포넌트: children은 문제지 본문이며, fit 활성화 시 1페이지 규격에 맞게 자동 축소합니다.
 * answerKey는 본문 하단에 공간 여유가 있을 때 병합 배치되며, 공간 부족 시 자동으로 새 페이지로 분리됩니다.
 * 통일된 여백을 유지하며, 폰트 로딩 및 인쇄 직전 레이아웃을 재측정하여 문제가 잘리지 않도록 보호합니다.
 */
export function A4Sheet({ children, fit = false, answerKey }: {
  children: React.ReactNode;
  fit?: boolean;
  answerKey?: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const [separateAnswer, setSeparateAnswer] = useState(false);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    let disposed = false;

    // 이전 축소 비율이 새 문항 배치에 왜곡을 주지 않도록 기본 높이로 복원 후 재측정
    const fitContent = () => {
      if (disposed) return;
      content.style.zoom = '1';
      content.style.height = 'auto';
      const availableHeight = content.parentElement!.getBoundingClientRect().height;
      const availableWidth = content.clientWidth;
      const worksheetHeight = content.firstElementChild!.getBoundingClientRect().height;
      const answerHeight = answerRef.current?.getBoundingClientRect().height ?? 0;
      const nextSeparate = Boolean(answerKey) && worksheetHeight + answerHeight > availableHeight;
      if (nextSeparate !== separateAnswer) {
        setSeparateAnswer(nextSeparate);
        return;
      }
      // 가로셈 및 나머지 연산 문항의 최소 열 너비를 축소 계산에 반영하여 인접 열 겹침 방지
      const grid = content.querySelector<HTMLElement>('.worksheet-grid');
      const gridStyle = grid ? getComputedStyle(grid) : null;
      const columnCount = gridStyle?.gridTemplateColumns.split(' ').length ?? 1;
      const gap = parseFloat(gridStyle?.columnGap ?? '0') || 0;
      const cellWidth = grid ? Math.max(0, ...Array.from(grid.children, cell =>
        cell.scrollWidth > cell.clientWidth
          ? cell.scrollWidth + (cell as HTMLElement).offsetWidth - cell.clientWidth + 1
          : cell.getBoundingClientRect().width
      )) : 0;
      const requiredWidth = Math.max(content.scrollWidth, cellWidth * columnCount + gap * (columnCount - 1));
      const scale = fit
        ? Math.min(1, availableHeight / content.scrollHeight, availableWidth / requiredWidth)
        : 1;
      content.style.zoom = String(scale);
      content.style.height = fit ? `${availableHeight / scale}px` : 'auto';
    };

    fitContent();
    void document.fonts.ready.then(fitContent);
    window.addEventListener('beforeprint', fitContent);
    return () => {
      disposed = true;
      window.removeEventListener('beforeprint', fitContent);
    };
  }, [children, fit, answerKey, separateAnswer]);

  const answer = answerKey ? <div ref={answerRef} className="a4-answer-section">{answerKey}</div> : null;

  return (
    <>
      <section className={`a4-sheet${fit ? ' a4-sheet-fit' : ''}`}>
        <div className="a4-sheet-area">
          <div ref={contentRef} className="a4-sheet-content">
            {children}
            {!separateAnswer && answer}
          </div>
        </div>
      </section>
      {separateAnswer && <A4Sheet>{answer}</A4Sheet>}
    </>
  );
}
