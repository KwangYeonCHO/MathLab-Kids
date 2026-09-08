'use client';

import React from 'react';
import { Problem } from '@/domain/math/types';
import { FractionValue } from '@/domain/math/core/fraction';
import { HorizontalProblem } from './HorizontalProblem';
import { VerticalProblem } from './VerticalProblem';
import { FractionProblem } from './FractionProblem';
import { MixedOpProblem } from './MixedOpProblem';
import { ProportionProblem } from './ProportionProblem';
import { FactorProblem } from './FactorProblem';

export interface UniversalProblemProps {
  problem: Problem;
  userAnswer?: number | null;
  userRemainder?: number | null;
  userFraction?: FractionValue | null;
  rawInput?: string;
  onAnswerChange?: (val: number | null) => void;
  onRemainderChange?: (val: number | null) => void;
  onFractionChange?: (val: FractionValue | null) => void;
  onFocus?: () => void;
  onFocusAnswer?: () => void;
  onFocusRemainder?: () => void;
  onFocusFractionPart?: (part: 'whole' | 'num' | 'den') => void;
  activeFractionPart?: 'whole' | 'num' | 'den';
  onSubmit?: () => void;
  isReadOnly?: boolean;
  showAnswer?: boolean;
  showExampleAnswer?: boolean;
  compact?: boolean;
  fullWidth?: boolean;
  density?: 'normal' | 'compact' | 'dense' | 'ultra-dense';
  virtualKeyboard?: boolean;
}

export function UniversalProblem(props: UniversalProblemProps) {
  const { problem } = props;

  if (problem.category === 'fraction') {
    return (
      <FractionProblem
        {...props}
        activePart={props.activeFractionPart}
        onFocusPart={props.onFocusFractionPart}
      />
    );
  }

  if (problem.category === 'mixed_operation') {
    return <MixedOpProblem {...props} />;
  }

  if (problem.category === 'proportion') {
    return <ProportionProblem {...props} />;
  }

  if (problem.category === 'factors_multiples') {
    return <FactorProblem {...props} />;
  }

  if (problem.displayFormat === 'vertical') {
    return <VerticalProblem {...props} />;
  }

  return <HorizontalProblem {...props} />;
}
