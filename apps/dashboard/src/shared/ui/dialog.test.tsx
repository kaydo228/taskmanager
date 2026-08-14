import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Dialog } from '@taskflow/shared/ui';

Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
  configurable: true,
  value() {
    this.setAttribute('open', '');
  },
});

afterEach(() => vi.useRealTimers());

it('plays the exit transition before closing', () => {
  vi.useFakeTimers();
  const onClose = vi.fn();

  render(
    <Dialog onClose={onClose} open title="Новая задача">
      <p>Содержимое</p>
    </Dialog>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }));

  expect(screen.getByRole('dialog')).toHaveClass('ui-dialog--closing');
  expect(onClose).not.toHaveBeenCalled();

  act(() => vi.advanceTimersByTime(180));
  expect(onClose).toHaveBeenCalledOnce();
});
