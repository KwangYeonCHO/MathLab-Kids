'use client';

import React, { useEffect, useState } from 'react';
import { NumberOperandRule } from '@/domain/math/types';

/** 각 피연산자의 자연수 범위를 검증하고 적용하며, 범위에 해당하는 자릿수도 함께 갱신합니다. */
export function OperandRangeInputs({ operand, label, onChange, disabled = false, allowZero = false }: {
  operand: NumberOperandRule;
  label: string;
  onChange: (operand: NumberOperandRule) => void;
  disabled?: boolean;
  allowZero?: boolean;
}) {
  const [min, setMin] = useState(operand.min?.toString() ?? '');
  const [max, setMax] = useState(operand.max?.toString() ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    setMin(operand.min?.toString() ?? '');
    setMax(operand.max?.toString() ?? '');
    setError('');
  }, [operand]);

  // 두 경계를 한 번에 저장하여 입력 도중 역전된 범위로 문제를 생성하지 않도록 합니다.
  const applyRange = () => {
    const lower = Number(min);
    const upper = Number(max);
    if (min === '' || max === '' || !Number.isInteger(lower) || !Number.isInteger(upper) ||
      lower < (allowZero ? 0 : 1) || upper > 9999 || lower > upper) {
      setError(`최솟값과 최댓값을 ${allowZero ? 0 : 1}~9999 사이의 정수로 입력해 주세요. 최솟값은 최댓값 이하여야 합니다.`);
      return;
    }
    const digits = [1, 2, 3, 4].filter(digit =>
      upper >= (digit === 1 ? 0 : 10 ** (digit - 1)) && lower <= 10 ** digit - 1
    );
    onChange({ ...operand, min: lower, max: upper, digits });
    setError('');
  };

  return (
    <div className="pt-3 border-t border-slate-200 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs font-semibold text-slate-600">
          최솟값
          <input aria-label={`${label} 최솟값`} type="number" min={allowZero ? 0 : 1} max={9999} step={1}
            value={min} onChange={e => { setMin(e.target.value); setError(''); }} disabled={disabled}
            placeholder="예: 9" className="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm disabled:bg-slate-100" />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          최댓값
          <input aria-label={`${label} 최댓값`} type="number" min={allowZero ? 0 : 1} max={9999} step={1}
            value={max} onChange={e => { setMax(e.target.value); setError(''); }} disabled={disabled}
            placeholder="예: 20" className="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm disabled:bg-slate-100" />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" disabled={disabled} onClick={applyRange}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-50">범위 적용</button>
        <button type="button" disabled={disabled} onClick={() => onChange({ ...operand, min: undefined, max: undefined })}
          className="px-2 py-1.5 text-xs text-slate-500 disabled:opacity-50">범위 해제</button>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">
        {disabled ? '자연수 사칙연산에서 범위를 설정할 수 있습니다.' : '범위 적용 시 자릿수를 자동 선택합니다. 자릿수 버튼을 누르면 범위가 해제됩니다. 정답은 범위를 벗어날 수 있습니다.'}
      </p>
      {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
