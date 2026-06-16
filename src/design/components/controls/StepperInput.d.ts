import * as React from 'react';

/**
 * A numeric money field with − / + steppers, in the amber "assumption"
 * language. Every value here is an editable planning input.
 *
 * @startingPoint section="Controls" subtitle="$ numeric stepper field" viewport="220x70"
 */
export interface StepperInputProps {
  /** Current numeric value. */
  value: number | string;
  /** Called with the clamped next value. */
  onChange?: (value: number) => void;
  /** Increment per stepper press. */
  step?: number;
  min?: number;
  max?: number;
  /** Leading unit, default "$". */
  prefix?: string;
  /** Trailing unit, e.g. "/hr". */
  suffix?: string;
  /** Accessible label for the input. */
  ariaLabel?: string;
  /** Control width. */
  width?: string;
  style?: React.CSSProperties;
}

export function StepperInput(props: StepperInputProps): JSX.Element;
