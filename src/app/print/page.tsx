'use client';

import React, { useState, useEffect } from 'react';
import { useWorksheetStore } from '@/stores/worksheetStore';
import { generateWorksheet } from '@/domain/math/generators/engine';
import { Problem } from '@/domain/math/types';
import { PrintWorksheet, getAutoColumns, calculatePrintDensity } from '@/components/print/PrintWorksheet';
import { PrintAnswerKey } from '@/components/print/PrintAnswerKey';
import { A4Sheet } from '@/components/print/A4Sheet';
import { Printer, RefreshCw, ArrowLeft, CheckSquare, Square, Sparkles, Files, Type, Minus, Plus } from 'lucide-react';
import Link from 'next/link';

export default function PrintPage() {
  const {
    currentRule,
    setRule,
    problems,
    generateNewProblems,
    printColumns = 'auto',
    setPrintColumns,
    printIncludeAnswerKey = false,
    setPrintIncludeAnswerKey,
    printIsCompact = true,
    setPrintIsCompact,
    printSheetCount = 1,
    setPrintSheetCount,
    printFontScale = 1.0,
    setPrintFontScale,
  } = useWorksheetStore();

  const [sheets, setSheets] = useState<Problem[][]>([]);

  const sheetCount = Math.max(1, Math.min(20, printSheetCount || 1));
  const columns = printColumns ?? 'auto';
  const includeAnswerKey = printIncludeAnswerKey ?? false;
  const isCompact = printIsCompact ?? true;
  const fontScale = printFontScale ?? 1.0;

  // 첫 번째 문제 세트 생성 확인 (비어있을 경우 스토어에서 생성)
  useEffect(() => {
    if (problems.length === 0) {
      generateNewProblems();
    }
  }, [problems.length, generateNewProblems]);

  // 현재 규칙 및 sheetCount에 따라 각 용지별 독립적인 무작위 문제 세트 준비
  useEffect(() => {
    setSheets((prev) => {
      const firstSet =
        problems.length === currentRule.count
          ? problems
          : prev[0]?.length === currentRule.count
          ? prev[0]
          : null;

      const newSheets: Problem[][] = [];
      if (firstSet) {
        newSheets.push(firstSet);
      } else {
        const res = generateWorksheet(currentRule);
        if (res.success && res.problems.length > 0) {
          newSheets.push(res.problems);
        }
      }

      // sheetCount보다 부족한 경우 독립적으로 무작위 생성된 문제 세트 보충
      for (let i = newSheets.length; i < sheetCount; i++) {
        const res = generateWorksheet(currentRule);
        if (res.success && res.problems.length > 0) {
          newSheets.push(res.problems);
        }
      }

      return newSheets.slice(0, sheetCount);
    });
  }, [currentRule, sheetCount, problems]);

  const handlePrint = () => {
    window.print();
  };

  const handleRefreshAll = () => {
    generateNewProblems();
    const newSheets: Problem[][] = [];
    for (let i = 0; i < sheetCount; i++) {
      const res = generateWorksheet(currentRule);
      if (res.success && res.problems.length > 0) {
        newSheets.push(res.problems);
      }
    }
    setSheets(newSheets);
  };

  const handleCountChange = (newCount: number) => {
    if (isNaN(newCount) || newCount < 5 || newCount > 100) return;
    const nextRule = { ...currentRule, count: newCount };
    setRule({ count: newCount });
    const newSheets: Problem[][] = [];
    for (let i = 0; i < sheetCount; i++) {
      const res = generateWorksheet(nextRule);
      if (res.success && res.problems.length > 0) {
        newSheets.push(res.problems);
      }
    }
    setSheets(newSheets);
  };

  const handleSheetCountChange = (newCount: number) => {
    const valid = Math.max(1, Math.min(20, isNaN(newCount) ? 1 : newCount));
    setPrintSheetCount(valid);
  };

  const effectiveColumns =
    columns === 'auto'
      ? getAutoColumns(currentRule.count, currentRule.displayFormat)
      : columns;

  const density = isCompact
    ? calculatePrintDensity(currentRule.count, effectiveColumns)
    : 'normal';

  const rowCount = Math.ceil(currentRule.count / effectiveColumns);

  const densityLabel = {
    'normal': '여유 공간',
    'compact': '표준 컴팩트',
    'dense': '고밀도 자동 압축',
    'ultra-dense': '초고밀도 극대 압축',
  }[density];

  return (
    <div className="print-page space-y-6 pb-20">
      {/* 인쇄 컨트롤 툴바 (인쇄 시 숨김: no-print) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5 no-print">
        {/* 상단 1열: 제목 & 액션 버튼 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              title="문제 만들기 설정으로 이동"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900">A4 학습지 인쇄 미리보기</h1>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  A4 1장 쏙 맞춤 ({densityLabel})
                </span>
                {sheetCount > 1 && (
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                    <Files className="w-3 h-3" />
                    총 {sheetCount}장 연속 인쇄
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                장당 <span className="font-bold text-emerald-600">{currentRule.count}문제</span> · <span className="font-bold text-slate-800">{effectiveColumns}열 {rowCount}행</span> 배치 · <span className="font-bold text-slate-700">총 {sheetCount}장</span> (총 <span className="font-bold text-emerald-700">{sheetCount * currentRule.count}문제</span> 각기 다른 랜덤 문제)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 새 문제 갱신 */}
            <button
              onClick={handleRefreshAll}
              title="모든 학습지의 문제를 새롭게 랜덤 생성"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <RefreshCw className="w-4 h-4" />
              <span>새 문제 번호</span>
            </button>

            {/* 인쇄 실행 버튼 */}
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-extrabold flex items-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>인쇄하기 ({sheetCount}장 PDF 저장)</span>
            </button>
          </div>
        </div>

        {/* 하단 2열: 사용자 맞춤 제어 (문제 수, 인쇄 매수, 열 수, 압축 옵션) */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. 문제 수 사용자 커스텀 */}
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
              <span className="px-2 font-bold text-slate-500">문항 수:</span>
              <div className="flex items-center gap-0.5">
                {[10, 20, 25, 30, 40, 50].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleCountChange(num)}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      currentRule.count === num
                        ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 pl-2 ml-1 border-l border-slate-200 pr-1">
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={currentRule.count}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) handleCountChange(val);
                  }}
                  className="w-12 px-1 py-0.5 text-center text-xs font-black text-slate-800 bg-white border border-slate-300 rounded focus:border-emerald-500 outline-none"
                  title="직접 입력 (5~100)"
                />
                <span className="text-[11px] font-semibold text-slate-400">제</span>
              </div>
            </div>

            {/* 2. 인쇄 매수 (여러 장 서로 다른 문제 세트 인쇄) */}
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
              <span className="px-2 font-bold text-slate-500">인쇄 매수:</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleSheetCountChange(num)}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      sheetCount === num
                        ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {num}장
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 pl-2 ml-1 border-l border-slate-200 pr-1">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={sheetCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) handleSheetCountChange(val);
                  }}
                  className="w-10 px-1 py-0.5 text-center text-xs font-black text-slate-800 bg-white border border-slate-300 rounded focus:border-emerald-500 outline-none"
                  title="인쇄할 서로 다른 학습지 매수 (1~20장)"
                />
                <span className="text-[11px] font-semibold text-slate-400">장</span>
              </div>
            </div>

            {/* 3. 배열 열 수 사용자 커스텀 */}
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
              <span className="px-2 font-bold text-slate-500">배열:</span>
              <button
                onClick={() => setPrintColumns('auto')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  columns === 'auto' ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200 font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="문제 수에 맞춰 가장 알맞은 열 수와 비율 자동 계산"
              >
                자동({effectiveColumns}열)
              </button>
              {([2, 3, 4, 5, 6] as const).map((col) => (
                <button
                  key={col}
                  onClick={() => setPrintColumns(col)}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    columns === col ? 'bg-white text-slate-900 shadow-xs border border-slate-300 font-black' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`${col}열 배치`}
                >
                  {col}열
                </button>
              ))}
            </div>

            {/* 4. 수식 글자 크기 조절 (행/열 그리드 유지, 내용물만 확대/축소) */}
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
              <span className="px-2 font-bold text-slate-500 flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-slate-400" />
                <span>수식 크기:</span>
              </span>
              <button
                onClick={() => setPrintFontScale(Math.max(0.7, Math.round((fontScale - 0.05) * 100) / 100))}
                disabled={fontScale <= 0.7}
                className="w-6 h-6 flex items-center justify-center rounded-lg font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                title="수식 글자 축소 (5% 단위)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div
                className="px-1.5 py-0.5 text-center text-xs font-black min-w-[46px] text-emerald-700 bg-white border border-emerald-200 rounded-md shadow-xs"
                title="현재 수식 크기 비율"
              >
                {Math.round(fontScale * 100)}%
              </div>
              <button
                onClick={() => setPrintFontScale(Math.min(1.5, Math.round((fontScale + 0.05) * 100) / 100))}
                disabled={fontScale >= 1.5}
                className="w-6 h-6 flex items-center justify-center rounded-lg font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                title="수식 글자 확대 (5% 단위)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-0.5 pl-1.5 ml-1 border-l border-slate-200">
                {[
                  { label: '작게', scale: 0.85 },
                  { label: '기본', scale: 1.0 },
                  { label: '크게', scale: 1.15 },
                  { label: '특대', scale: 1.3 },
                ].map((item) => (
                  <button
                    key={item.scale}
                    onClick={() => setPrintFontScale(item.scale)}
                    className={`px-1.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      Math.abs(fontScale - item.scale) < 0.01
                        ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200 font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. 인쇄 부가 기능 토글 */}
          <div className="flex items-center gap-2">
            {/* 컴팩트 1장 인쇄 토글 */}
            <button
              onClick={() => setPrintIsCompact(!isCompact)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                isCompact
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              {isCompact ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              1장 자동 압축
            </button>

            {/* 정답지 포함 토글 */}
            <button
              onClick={() => setPrintIncludeAnswerKey(!includeAnswerKey)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                includeAnswerKey
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              {includeAnswerKey ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              정답 포함 (여백에 자동 배치)
            </button>
          </div>
        </div>
      </div>

      {/* A4 종이 프리뷰 컨테이너 (단일 또는 다중 매수 연속 렌더링) */}
      <div className="a4-preview bg-slate-200/60 p-2 sm:p-6 rounded-3xl space-y-6">
        {(sheets.length > 0 ? sheets : [problems]).map((sheetProblems, idx) => (
          <div key={idx} className="sheet-wrapper relative">
            {sheetCount > 1 && (
              <div className="no-print flex items-center justify-between px-3 py-1.5 mb-2.5 bg-slate-100/90 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  제 {idx + 1}번째 학습지 (세트 {idx + 1} / {sheetCount})
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  랜덤 {sheetProblems.length}문제 세트
                </span>
              </div>
            )}

            <A4Sheet
              fit={isCompact}
              answerKey={
                includeAnswerKey ? (
                  <PrintAnswerKey
                    rule={currentRule}
                    problems={sheetProblems}
                    sheetIndex={idx + 1}
                    totalSheets={sheetCount}
                    showCutLine={true}
                  />
                ) : undefined
              }
            >
              <PrintWorksheet
                rule={currentRule}
                problems={sheetProblems}
                columns={columns}
                compact={isCompact}
                sheetIndex={idx + 1}
                totalSheets={sheetCount}
                fontScale={fontScale}
              />
            </A4Sheet>
          </div>
        ))}
      </div>
    </div>
  );
}
