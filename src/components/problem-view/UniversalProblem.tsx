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
  rawRemainder?: string;
  onAnswerChange?: (val: number | null) => void;
  onRemainderChange?: (val: number | null, raw?: string) => void;
  onFractionChange?: (val: FractionValue | null) => void;
  onFocus?: () => void;
  onFocusAnswer?: () => void;
  onFocusRemainder?: () => void;
  onFocusFractionPart?: (part: 'whole' | 'num' | 'den') => void;
  activeFractionPart?: 'whole' | 'num' | 'den';
  activeInputType?: 'answer' | 'remainder' | 'whole' | 'num' | 'den';
  autoFocus?: boolean;
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

  const handleFocusAnswer = () => {
    props.onFocusAnswer?.();
    props.onFocus?.();
  };

  const handleFocusRemainder = () => {
    props.onFocusRemainder?.();
    props.onFocus?.();
  };

  const handleFocusFractionPart = (part: 'whole' | 'num' | 'den') => {
    props.onFocusFractionPart?.(part);
    props.onFocus?.();
  };

  if (problem.category === 'fraction') {
    return (
      <FractionProblem
        {...props}
        autoFocus={props.autoFocus}
        activePart={props.activeFractionPart || (props.activeInputType as 'whole' | 'num' | 'den')}
        onFocusPart={handleFocusFractionPart}
      />
    );
  }

  if (problem.category === 'mixed_operation') {
    return <MixedOpProblem {...props} autoFocus={props.autoFocus} />;
  }

  if (problem.category === 'proportion') {
    return <ProportionProblem {...props} autoFocus={props.autoFocus} />;
  }

  if (problem.category === 'factors_multiples') {
    return <FactorProblem {...props} autoFocus={props.autoFocus} />;
  }

  if (problem.displayFormat === 'vertical') {
    return <VerticalProblem {...props} autoFocus={props.autoFocus} />;
  }

  return (
    <HorizontalProblem
      {...props}
      autoFocus={props.autoFocus}
      activeInputType={props.activeInputType}
      onFocusAnswer={handleFocusAnswer}
      onFocusRemainder={handleFocusRemainder}
    />
  );
}
