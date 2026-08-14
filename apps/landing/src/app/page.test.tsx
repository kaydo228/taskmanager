import { render, screen } from '@testing-library/react';
import { useReducedMotion } from 'motion/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('motion/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('motion/react')>();

  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
  };
});

import Home, { dashboardUrl } from './page';

class StubIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds = [0];

  disconnect() {}

  observe() {}

  takeRecords() {
    return [];
  }

  unobserve() {}
}

vi.stubGlobal('IntersectionObserver', StubIntersectionObserver);

afterEach(() => {
  vi.mocked(useReducedMotion).mockReturnValue(false);
});

describe('Home', () => {
  it('links the primary CTA to the board', () => {
    render(<Home />);

    expect(screen.getByRole('link', { name: 'Открыть доску' })).toHaveAttribute(
      'href',
      dashboardUrl,
    );
  });

  it('keeps every landing section hidden until it enters the viewport', () => {
    const { container } = render(<Home />);
    const sections = container.querySelectorAll('main > section');

    expect(sections).toHaveLength(4);

    sections.forEach((section) => {
      expect(section).toHaveStyle({ opacity: '0' });
      expect((section as HTMLElement).style.transform).toContain(
        'translateY(28px)',
      );
    });
  });

  it('shows every section immediately when reduced motion is requested', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);

    const { container } = render(<Home />);
    const sections = container.querySelectorAll('main > section');

    sections.forEach((section) => {
      expect(section).not.toHaveStyle({ opacity: '0' });
      expect((section as HTMLElement).style.transform).not.toContain(
        'translateY',
      );
    });
  });
});
