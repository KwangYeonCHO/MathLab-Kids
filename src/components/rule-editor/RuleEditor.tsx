'use client';

import React, { useState } from 'react';
import { useWorksheetStore } from '@/stores/worksheetStore';
import { Operation, CarryCondition, BorrowCondition, DivisionRemainderCondition, DisplayFormat, UniqueMode } from '@/domain/math/types';
import { PresetSelector } from './PresetSelector';
import { CreateActionButtons } from './CreateActionButtons';
import { Sliders, Settings2, Check, RotateCcw } from 'lucide-react';

export function RuleEditor() {
  const { currentRule, setRule, resetRuleToDefault } = useWorksheetStore();
  const [isAdvanced, setIsAdvanced] = useState(false);

  // 연산 종류 토글
  const handleToggleOperation = (op: Operation) => {
    let nextOps = [...currentRule.operations];
    if (nextOps.includes(op)) {
      if (nextOps.length > 1) {
        nextOps = nextOps.filter((o) => o !== op);
      }
    } else {
      nextOps.push(op);
    }
    setRule({ operations: nextOps });
  };

  // 자릿수 토글
  const handleToggleDigit = (target: 'A' | 'B', digit: number) => {
    const operandKey = target === 'A' ? 'operandA' : 'operandB';
    const currentDigits = currentRule[operandKey].digits;
    let nextDigits = [...currentDigits];

    if (nextDigits.includes(digit)) {
      if (nextDigits.length > 1) {
        nextDigits = nextDigits.filter((d) => d !== digit);
      }
    } else {
      nextDigits.push(digit);
      nextDigits.sort((a, b) => a - b);
    }

    setRule({
      [operandKey]: {
        ...currentRule[operandKey],
        digits: nextDigits,
      },
    });
  };

  const hasAddition = currentRule.operations.includes('addition');
  const hasSubtraction = currentRule.operations.includes('subtraction');
  const hasMultiplication = currentRule.operations.includes('multiplication');
  const hasDivision = currentRule.operations.includes('division');

  const digitLabels: Record<number, string> = {
    1: '한 자리 수',
    2: '두 자리 수',
    3: '세 자리 수',
    4: '네 자리 수',
  };

  return (
    <div className="space-y-6">
      {/* 1. 학년별 빠른 설정 */}
      <PresetSelector />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-800 text-lg">세부 문제 규칙 설정</h2>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              자동 기억됨
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('모든 규칙을 기본값으로 되돌리시겠습니까?')) {
                  resetRuleToDefault();
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="공식 기본 설정으로 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>기본값 초기화</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAdvanced(!isAdvanced)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isAdvanced
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              {isAdvanced ? '기본 설정 보기' : '고급 설정 보기'}
            </button>
          </div>
        </div>

        {/* 2. 연산 종류 */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2.5">
            연산 종류 <span className="text-xs text-slate-400 font-normal">(여러 개 선택 가능)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(
              [
                { id: 'addition', label: '덧셈 (+)' },
                { id: 'subtraction', label: '뺄셈 (−)' },
                { id: 'multiplication', label: '곱셈 (×)' },
                { id: 'division', label: '나눗셈 (÷)' },
              ] as const
            ).map((item) => {
              const active = currentRule.operations.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleOperation(item.id)}
                  className={`py-3 px-4 rounded-xl font-bold text-sm border flex items-center justify-between transition-all ${
                    active
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 자릿수 선택: 첫 번째 수 & 두 번째 수 */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-sm font-bold text-slate-700 mb-3">
            자릿수 설정 <span className="text-xs text-slate-400 font-normal">(복수 선택 가능)</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 첫 번째 수 (피연산자 A) 카드 */}
            <div className="p-4 rounded-xl border-2 border-emerald-500/25 bg-emerald-50/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                    1
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">
                    첫 번째 수
                  </span>
                  <span className="text-xs text-slate-400 font-normal">
                    (앞의 수 · 윗수)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  피연산자 A
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((digit) => {
                  const active = currentRule.operandA.digits.includes(digit);
                  return (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleToggleDigit('A', digit)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-between transition-all ${
                        active
                          ? 'border-emerald-500 bg-white text-emerald-800 shadow-sm ring-2 ring-emerald-500/25'
                          : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <span>{digitLabels[digit]}</span>
                      {active && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 두 번째 수 (피연산자 B) 카드 */}
            <div className="p-4 rounded-xl border-2 border-indigo-500/25 bg-indigo-50/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                    2
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">
                    두 번째 수
                  </span>
                  <span className="text-xs text-slate-400 font-normal">
                    (뒤의 수 · 아랫수)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                  피연산자 B
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((digit) => {
                  const active = currentRule.operandB.digits.includes(digit);
                  return (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleToggleDigit('B', digit)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-between transition-all ${
                        active
                          ? 'border-indigo-500 bg-white text-indigo-800 shadow-sm ring-2 ring-indigo-500/25'
                          : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <span>{digitLabels[digit]}</span>
                      {active && <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 4. 조건별 세부 설정 (받아올림, 받아내림, 나눗셈) */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          {/* 받아올림 조건 (덧셈 포함 시) */}
          {hasAddition && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                받아올림 조건 (덧셈)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(
                  [
                    { id: 'any', label: '제한 없음' },
                    { id: 'none', label: '받아올림 없음' },
                    { id: 'once', label: '받아올림 한 번' },
                    { id: 'twice', label: '받아올림 두 번' },
                    { id: 'more', label: '세 번 이상' },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setRule({ carryCondition: c.id as CarryCondition })}
                    className={`py-2 px-2.5 rounded-lg text-xs border text-center transition-all ${
                      currentRule.carryCondition === c.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 받아내림 조건 (뺄셈 포함 시) */}
          {hasSubtraction && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                받아내림 조건 (뺄셈)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(
                  [
                    { id: 'any', label: '제한 없음' },
                    { id: 'none', label: '받아내림 없음' },
                    { id: 'once', label: '받아내림 한 번' },
                    { id: 'twice', label: '받아내림 두 번' },
                    { id: 'continuous', label: '연속 받아내림' },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setRule({ borrowCondition: c.id as BorrowCondition })}
                    className={`py-2 px-2.5 rounded-lg text-xs border text-center transition-all ${
                      currentRule.borrowCondition === c.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 나눗셈 나머지 조건 */}
          {hasDivision && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                나눗셈 조건
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'none', label: '나머지가 없는 나눗셈' },
                    { id: 'required', label: '나머지가 있는 나눗셈' },
                    { id: 'mixed', label: '둘 다 섞기' },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setRule({ divisionCondition: c.id as DivisionRemainderCondition })}
                    className={`py-2 px-3 rounded-lg text-xs border text-center transition-all ${
                      currentRule.divisionCondition === c.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. 문제 수 & 보기 방식 & 첫 문제 예시 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700">
                문제 수
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={currentRule.count}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= 100) {
                      setRule({ count: val });
                    }
                  }}
                  className="w-14 px-1.5 py-0.5 text-center text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                />
                <span className="text-[11px] font-bold text-slate-500">문제</span>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {[10, 20, 25, 30, 40, 50].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRule({ count: num })}
                  className={`py-1.5 rounded-lg text-xs border font-semibold transition-all ${
                    currentRule.count === num
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1">
              * 버튼 선택 또는 직접 입력 (5~100문제)
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              보기 방식
            </label>
            <div className="flex gap-2">
              {(
                [
                  { id: 'horizontal', label: '가로셈' },
                  { id: 'vertical', label: '세로셈' },
                  { id: 'mixed', label: '혼합' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setRule({ displayFormat: f.id as DisplayFormat })}
                  className={`flex-1 py-2 rounded-lg text-xs border font-semibold transition-all ${
                    currentRule.displayFormat === f.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              첫 문제 정답 예시
            </label>
            <button
              type="button"
              onClick={() => setRule({ showFirstExample: !currentRule.showFirstExample })}
              className={`w-full py-2 px-3 rounded-lg text-xs border font-semibold flex items-center justify-center gap-2 transition-all ${
                currentRule.showFirstExample
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${currentRule.showFirstExample ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              {currentRule.showFirstExample ? '예시 표시 켜짐' : '예시 표시 꺼짐'}
            </button>
          </div>
        </div>

        {/* 6. 고급 설정 영역 (토글 열림 시) */}
        {isAdvanced && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 pt-4 animate-in fade-in duration-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              고급 설정 (세부 제어)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 끝자리 0 허용 여부 */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">일의 자리 0 끝수 허용</span>
                <input
                  type="checkbox"
                  checked={currentRule.operandA.allowZeroEnding !== false}
                  onChange={(e) =>
                    setRule({
                      operandA: { ...currentRule.operandA, allowZeroEnding: e.target.checked },
                      operandB: { ...currentRule.operandB, allowZeroEnding: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>

              {/* 중복 금지 모드 */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">교환법칙 중복 제외 (3×7 == 7×3)</span>
                <input
                  type="checkbox"
                  checked={currentRule.uniqueMode === 'commutative'}
                  onChange={(e) =>
                    setRule({ uniqueMode: e.target.checked ? 'commutative' : 'exact' })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* 하단 액션 버튼 (인쇄하기 / 온라인으로 풀기) */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <CreateActionButtons />
        </div>
      </div>
    </div>
  );
}
