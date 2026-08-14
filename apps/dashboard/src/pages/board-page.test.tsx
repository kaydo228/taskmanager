import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { BoardPage } from './board-page';

describe('BoardPage', () => {
  beforeEach(() => window.localStorage.clear());

  it('loads nine demo tasks and returns to empty after clearing', async () => {
    const user = userEvent.setup();
    render(<BoardPage />);

    expect(screen.getByText('Доска пока пуста')).toBeVisible();
    const createTaskLink = screen.getByRole('link', {
      name: 'Создать задачу',
    });
    expect(createTaskLink).toHaveClass('dashboard-page__create');
    expect(createTaskLink).toHaveStyle({ color: '#fff' });

    await user.click(
      screen.getByRole('button', { name: 'Загрузить демо-данные' }),
    );
    expect(await screen.findByText('План релиза')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Очистить доску' }));
    expect(screen.getByText('Доска пока пуста')).toBeVisible();
  });
});
