import * as React from 'react';

/**
 * A binary (or few-option) segmented control in the amber "assumption"
 * language — built for the 32 ⇄ 40 hour switch.
 *
 * @startingPoint section="Controls" subtitle="32/40 segmented toggle" viewport="220x70"
 */
export interface SegmentedToggleProps {
  /** Choices, in order. */
  options: Array<{ value: string | number; label: React.ReactNode }>;
  /** Currently selected value. */
  value: string | number;
  /** Called with the newly selected value. */
  onChange?: (value: string | number) => void;
  /** Form name applied to each segment. */
  name?: string;
  /** Density. */
  size?: 'sm' | 'md';
  /** Accessible label for the radiogroup. */
  ariaLabel?: string;
  style?: React.CSSProperties;
}

export function SegmentedToggle(props: SegmentedToggleProps): JSX.Element;
