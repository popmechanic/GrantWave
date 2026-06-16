import * as React from 'react';

/**
 * The signature "The Ask" hero banner — butter-cream, radio-wave framed,
 * with the single ask figure set large in the display serif.
 *
 * @startingPoint section="Hero" subtitle="'The Ask' hero banner" viewport="900x320"
 */
export interface AskHeroProps extends React.HTMLAttributes<HTMLElement> {
  /** Kicker above the headline. Default "The Ask". */
  eyebrow?: string;
  /** Serif headline — the human framing of the request. */
  headline: React.ReactNode;
  /** The big ask figure, pre-formatted (e.g. "$72,400"). */
  amount: React.ReactNode;
  /** Small line under the amount (e.g. "added to payroll, per year"). */
  amountCaption?: React.ReactNode;
  /** Supporting paragraph under the headline. */
  children?: React.ReactNode;
}

export function AskHero(props: AskHeroProps): JSX.Element;
