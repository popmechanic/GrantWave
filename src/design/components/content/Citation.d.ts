import * as React from 'react';

/** Inline superscript reference marker, e.g. [2], placed after a figure. */
export interface CitationMarkProps extends React.HTMLAttributes<HTMLElement> {
  /** The reference number. */
  n: number | string;
}
export function CitationMark(props: CitationMarkProps): JSX.Element;

/**
 * A checkable source footnote with an external link — cited facts always
 * show their work.
 */
export interface CitationProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Matching reference number. */
  n?: number | string;
  /** Source description, e.g. "IRS Form 990, 2024, line 9". */
  source: React.ReactNode;
  /** External URL the board can click to verify. */
  href?: string;
  /** Optional retrieval date. */
  retrieved?: string;
}
export function Citation(props: CitationProps): JSX.Element;
