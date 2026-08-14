import type { ReactNode } from 'react';

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'low' | 'medium' | 'high' | 'neutral';
}) {
  return <span className={`ui-badge ui-badge--${tone}`}>{children}</span>;
}
