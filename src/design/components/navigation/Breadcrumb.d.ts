import * as React from 'react';

/**
 * Uppercase breadcrumb trail across the five-chapter presentation.
 *
 * @startingPoint section="Navigation" subtitle="Breadcrumb trail" viewport="420x40"
 */
export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Trail items, root first. Last item is rendered as the current page. */
  items: Array<{ label: React.ReactNode; href?: string }>;
}

export function Breadcrumb(props: BreadcrumbProps): JSX.Element;
