import * as React from 'react';

/**
 * A warm narrative callout that sits between the data — where the human
 * voice explains what a number means for KMUN's people.
 *
 * @startingPoint section="Content" subtitle="Story / callout block" viewport="520x180"
 */
export interface StoryBlockProps extends React.HTMLAttributes<HTMLElement> {
  /** Tone — maps to the meaning system; `note` is neutral. */
  tone?: 'note' | 'fact' | 'assumption' | 'warning';
  /** Uppercase kicker above the title. */
  eyebrow?: string;
  /** Serif title line. */
  title?: React.ReactNode;
  /** Body copy. */
  children?: React.ReactNode;
}

export function StoryBlock(props: StoryBlockProps): JSX.Element;
