import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TaskDescription } from './task-description';

describe('TaskDescription', () => {
  it('renders legacy descriptions as text', () => {
    render(<TaskDescription description="Обычный текст" />);

    expect(screen.getByText('Обычный текст')).toBeVisible();
  });

  it('renders formatted JSON as semantic React elements', () => {
    render(
      <TaskDescription
        description={
          'tiptap:{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"План"}]},{"type":"paragraph","content":[{"type":"text","text":"Важно","marks":[{"type":"bold"}]}]}]}'
        }
      />,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'План' }),
    ).toBeVisible();
    expect(screen.getByText('Важно').tagName).toBe('STRONG');
  });

  it('does not execute or inject malformed stored content', () => {
    render(
      <TaskDescription
        description={
          'tiptap:{"type":"doc","content":[{"type":"script","content":[{"type":"text","text":"alert(1)"}]}]}'
        }
      />,
    );

    expect(document.querySelector('script')).not.toBeInTheDocument();
    expect(screen.getByText(/tiptap:/)).toBeVisible();
  });

  it('renders nothing for an empty description', () => {
    const { container } = render(<TaskDescription description="" />);

    expect(container).toBeEmptyDOMElement();
  });
});
