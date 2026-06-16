import * as React from 'react';

/**
 * One entry in a chart legend; its swatch matches how the series is drawn.
 *
 * @startingPoint section="Content" subtitle="Chart legend chip" viewport="200x44"
 */
export interface LegendChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Series label. */
  label: React.ReactNode;
  /** Swatch color (CSS value or token). */
  color?: string;
  /** Swatch style — match how the series renders. */
  sample?: 'line' | 'dashed' | 'band' | 'dot';
}

export function LegendChip(props: LegendChipProps): JSX.Element;
