import * as React from 'react';

/**
 * A large, friendly entry point to one chapter on the hub — numbered,
 * serif-titled, with a hover lift.
 *
 * @startingPoint section="Navigation" subtitle="Chapter tile" viewport="300x220"
 */
export interface ChapterTileProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Chapter number (zero-padded automatically). */
  number: number | string;
  /** Serif chapter title. */
  title: React.ReactNode;
  /** One-line plain description. */
  description?: React.ReactNode;
  /** Destination. */
  href?: string;
}

export function ChapterTile(props: ChapterTileProps): JSX.Element;
