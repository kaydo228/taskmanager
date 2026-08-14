import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dropdown } from '@taskflow/shared/ui';

const options = [
  { label: 'Низкий', value: 'low' },
  { label: 'Средний', value: 'medium' },
  { label: 'Высокий', value: 'high' },
] as const;

describe('Dropdown', () => {
  it('selects an option and closes the menu', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Dropdown
        label="Приоритет"
        onChange={onChange}
        options={options}
        value="medium"
      />,
    );

    await user.click(screen.getByRole('button', { name: /Приоритет/ }));
    await user.click(screen.getByRole('option', { name: 'Высокий' }));

    expect(onChange).toHaveBeenCalledWith('high');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Dropdown
        label="Приоритет"
        onChange={vi.fn()}
        options={options}
        value="medium"
      />,
    );

    const trigger = within(container).getByRole('button', {
      name: /Приоритет/,
    });
    await user.click(trigger);
    await user.keyboard('{Escape}');

    expect(within(container).queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
