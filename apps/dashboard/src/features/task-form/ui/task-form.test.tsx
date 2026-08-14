import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskForm } from './task-form';

describe('TaskForm', () => {
  it('shows an error and keeps the task unsaved when title is empty', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<TaskForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(await screen.findByText('Введите название задачи')).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the priority selected through the custom dropdown', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<TaskForm onSubmit={onSubmit} />);
    const form = within(container);

    await user.type(
      container.querySelector<HTMLInputElement>('input[name="title"]')!,
      'Проверить релиз',
    );
    fireEvent.change(
      container.querySelector<HTMLInputElement>('input[name="dueDate"]')!,
      {
        target: { value: '2026-08-20' },
      },
    );
    await user.click(form.getByRole('button', { name: /Приоритет/ }));
    await user.click(form.getByRole('option', { name: 'Высокий' }));
    await user.click(form.getByRole('button', { name: 'Сохранить' }));

    expect(onSubmit.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ priority: 'high' }),
    );
  });

  it('submits formatted editor content through the existing string field', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<TaskForm onSubmit={onSubmit} />);

    await user.type(
      screen.getByLabelText('Название задачи'),
      'Описание релиза',
    );
    fireEvent.change(screen.getByLabelText('Срок'), {
      target: { value: '2026-08-20' },
    });
    await user.type(
      screen.getByRole('textbox', { name: 'Описание' }),
      'Новый текст',
    );
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSubmit.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        description: expect.stringMatching(/^tiptap:/),
        title: 'Описание релиза',
      }),
    );
    expect(container.querySelector('textarea')).not.toBeInTheDocument();
  });
});
