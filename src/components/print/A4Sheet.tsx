'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';

/**
 * 共用的 A4 纸张：children 为纸张内容，fit 开启时按实际尺寸缩放至一页。
 * answerKey 在自然排版有剩余空间时合并，否则另起一页。
 * 返回带统一页边距的纸张；字体加载及打印前重新测量，不裁切题目。
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

    // 先恢复自然高度再测量，避免上一次缩放影响新题量的排版。
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
      // 横式和带余数题目的最小列宽也参与缩放，避免相邻列互相覆盖。
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
