import * as React from 'react';

/**
 * The retro multi-stripe "radio wave" accent band.
 */
export interface WaveBandProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Band height (CSS value). Default `var(--wave-band)` = 8px. */
  height?: string;
}

export function WaveBand(props: WaveBandProps): JSX.Element;
