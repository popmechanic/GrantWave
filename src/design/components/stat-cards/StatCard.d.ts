import * as React from 'react';

/**
 * A single headline figure in one of three meaning tiers: a calm "fact",
 * an interactive "assumption" (dashed amber), or a "warning" to watch.
 *
 * @startingPoint section="Data" subtitle="Fact / assumption / warning stat card" viewport="260x200"
 */
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Meaning tier. Drives border style, surface, tag and glyph. */
  variant?: 'fact' | 'assumption' | 'warning';
  /** Uppercase eyebrow label above the figure. */
  label?: string;
  /** The headline figure itself (already formatted, e.g. "48,200"). */
  value?: React.ReactNode;
  /** Small leading unit, e.g. "$". */
  prefix?: string;
  /** Small trailing unit, e.g. "/yr" or "hrs". */
  suffix?: string;
  /** Supporting line under the figure. */
  caption?: React.ReactNode;
  /** Override the worded status tag (defaults: Fact / Assumption / Watch). */
  tag?: string;
  /** Extra content (e.g. an embedded toggle) rendered below the caption. */
  children?: React.ReactNode;
}

export function StatCard(props: StatCardProps): JSX.Element;
