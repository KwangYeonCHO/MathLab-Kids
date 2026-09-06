'use client';

import React, { useState, useEffect } from 'react';
import { useWorksheetStore } from '@/stores/worksheetStore';
import { PrintWorksheet, getAutoColumns, calculatePrintDensity } from '@/components/print/PrintWorksheet';
import { PrintAnswerKey } from '@/components/print/PrintAnswerKey';
import { Printer, RefreshCw, ArrowLeft, CheckSquare, Square, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PrintPage() {
  const { currentRule, setRule, problems, generateNewProblems } = useWorksheetStore();
  const [columns, setColumns] = useState<'auto' | 2 | 3 | 4 | 5 | 6>('auto');
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false); // 默认不包含答案纸，练习纸更纯粹
  const [isCompact, setIsCompact] = useState(true); // 默认开启紧凑模式，确保 1 张 A4 纸打印

  useEffect(() => {
    if (problems.length === 0) {
      generateNewProblems();
    }
  }, [problems.length, generateNewProblems]);

  const handlePrint = () => {
    window.print();
  };

  const handleCountChange = (newCount: number) => {
    if (isNaN(newCount) || newCount < 5 || newCount > 100) return;
    setRule({ count: newCount });
    generateNewProblems();
  };

  const effectiveColumns =
    columns === 'auto'
      ? getAutoColumns(problems.length, currentRule.displayFormat)
      : columns;

  const density = isCompact
    ? calculatePrintDensity(problems.length, effectiveColumns)
    : 'normal';

  const rowCount = Math.ceil(problems.length / effectiveColumns);

  const densityLabel = {
    'normal': '여유 공간',
    'compact': '표준 컴팩트',
    'dense': '고밀도 자동 압축',
    'ultra-dense': '초고밀도 극대 압축',
  }[density];

  return (
    <div className="space-y-6 pb-20">
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
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                총 <span className="font-bold text-emerald-600">{problems.length}문제</span> 감지됨 · <span className="font-bold text-slate-800">{effectiveColumns}열 {rowCount}행</span> 배치로 단 한 장의 A4 용지에 알뜰하게 인쇄됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 새 문제 갱신 */}
            <button
              onClick={() => generateNewProblems()}
              title="동일 조건 새 문제 생성"
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
              인쇄하기 (PDF 저장)
            </button>
          </div>
        </div>

        {/* 하단 2열: 사용자 맞춤 제어 (문제 수 커스텀, 열 수 커스텀, 압축 옵션) */}
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

            {/* 2. 배열 열 수 사용자 커스텀 */}
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
              <span className="px-2 font-bold text-slate-500">배열:</span>
              <button
                onClick={() => setColumns('auto')}
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
                  onClick={() => setColumns(col)}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    columns === col ? 'bg-white text-slate-900 shadow-xs border border-slate-300 font-black' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`${col}열 배치`}
                >
                  {col}열
                </button>
              ))}
            </div>
          </div>

          {/* 3. 인쇄 부가 기능 토글 */}
          <div className="flex items-center gap-2">
            {/* 컴팩트 1장 인쇄 토글 */}
            <button
              onClick={() => setIsCompact(!isCompact)}
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
              onClick={() => setIncludeAnswerKey(!includeAnswerKey)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                includeAnswerKey
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              {includeAnswerKey ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              정답지 포함 (2페이지)
            </button>
          </div>
        </div>
      </div>

      {/* A4 종이 프리뷰 컨테이너 */}
      <div className="flex justify-center bg-slate-200/60 p-2 sm:p-6 rounded-3xl print:p-0 print:bg-transparent">
        <div className="w-full max-w-[210mm] bg-white shadow-xl rounded-sm print:shadow-none print:rounded-none min-h-[297mm] print:min-h-0 p-4 sm:p-8 print:p-0 print:m-0 print:w-full print:max-w-none">
          <PrintWorksheet
            rule={currentRule}
            problems={problems}
            columns={columns}
            compact={isCompact}
          />

          {includeAnswerKey && (
            <PrintAnswerKey
              rule={currentRule}
              problems={problems}
            />
          )}
        </div>
      </div>
    </div>
  );
}
