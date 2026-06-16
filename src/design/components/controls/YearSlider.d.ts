import * as React from 'react';

/**
 * A labeled range slider for picking a projection year, with the amber
 * assumption accent on the filled track and thumb.
 *
 * @startingPoint section="Controls" subtitle="Year range slider" viewport="320x90"
 */
export interface YearSliderProps {
  min?: number;
  max?: number;
  step?: number;
  /** Current year value. */
  value: number;
  /** Called with the new year. */
  onChange?: (value: number) => void;
  /** Eyebrow label above the slider. */
  label?: string;
  style?: React.CSSProperties;
}

export function YearSlider(props: YearSliderProps): JSX.Element;
