import * as React from 'react';

/**
 * The page masthead — KMUN wordmark, station ID, optional title and a
 * right-side slot, over a radio-wave band.
 *
 * @startingPoint section="Brand" subtitle="Station masthead" viewport="900x120"
 */
export interface MastheadProps extends React.HTMLAttributes<HTMLElement> {
  /** Path to the KMUN wordmark image (copy into your assets first). */
  logoSrc?: string;
  /** Frequency line, default "91.9 FM". */
  frequency?: string;
  /** Location line, default "Astoria, Oregon". */
  location?: string;
  /** Optional serif title shown beside the station ID. */
  title?: React.ReactNode;
  /** Right-side slot — breadcrumb, print button, etc. */
  children?: React.ReactNode;
}

export function Masthead(props: MastheadProps): JSX.Element;
