import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskDescriptionEditor } from './task-description-editor';

describe('TaskDescriptionEditor', () => {
  it('emits a prefixed document with bold text', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TaskDescriptionEditor onChange={onChange} value="" />);

    await user.click(screen.getByRole('button', { name: 'Жирный' }));
    await user.type(screen.getByRole('textbox', { name: 'Описание' }), 'Важно');

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const stored = onChange.mock.calls.at(-1)?.[0] as string;
    expect(stored.startsWith('tiptap:')).toBe(true);
    expect(JSON.parse(stored.slice(7))).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Важно' }],
        },
      ],
    });
  });

  it('emits an empty string after all editor content is removed', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TaskDescriptionEditor onChange={onChange} value="Старый текст" />);
    const textbox = screen.getByRole('textbox', { name: 'Описание' });

    await user.click(textbox);
    await user.keyboard('{Control>}a{/Control}{Backspace}');

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(''));
  });

  it('shows a local error for an unsafe link and closes the panel with Escape', async () => {
    const user = userEvent.setup();
    render(<TaskDescriptionEditor onChange={vi.fn()} value="Ссылка" />);

    await user.click(screen.getByRole('button', { name: 'Ссылка' }));
    const input = screen.getByRole('textbox', { name: 'Адрес ссылки' });
    await user.type(input, 'javascript:alert(1)');
    await user.click(screen.getByRole('button', { name: 'Применить ссылку' }));
    expect(
      screen.getByText('Введите полный адрес с http:// или https://'),
    ).toBeVisible();

    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('textbox', { name: 'Адрес ссылки' }),
    ).not.toBeInTheDocument();
  });

  it('syncs a changed external value without emitting an update', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <TaskDescriptionEditor onChange={onChange} value="Первый" />,
    );

    expect(screen.getByRole('textbox', { name: 'Описание' })).toHaveTextContent(
      'Первый',
    );
    expect(onChange).not.toHaveBeenCalled();

    rerender(<TaskDescriptionEditor onChange={onChange} value="Второй" />);

    await waitFor(() =>
      expect(
        screen.getByRole('textbox', { name: 'Описание' }),
      ).toHaveTextContent('Второй'),
    );
    expect(onChange).not.toHaveBeenCalled();
  });
});
