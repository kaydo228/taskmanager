import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@taskflow/shared/ui';

describe('Button', () => {
  it('activates from the keyboard', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Создать</Button>);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('button', { name: 'Создать' })).toHaveFocus();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
