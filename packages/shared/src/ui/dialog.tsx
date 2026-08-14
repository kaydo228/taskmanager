import { useEffect, useRef, useState, type ReactNode } from 'react';

const exitDuration = 180;

type DialogProps = {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

export function Dialog({ children, onClose, open, title }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setIsClosing(false);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function requestClose() {
    const reducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    )?.matches;

    if (isClosing || reducedMotion) {
      if (!isClosing) onClose();
      return;
    }

    setIsClosing(true);
    window.setTimeout(onClose, exitDuration);
  }

  return (
    <dialog
      aria-labelledby="ui-dialog-title"
      className={`ui-dialog${isClosing ? ' ui-dialog--closing' : ''}`}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      ref={ref}
    >
      <div className="ui-dialog__header">
        <h2 id="ui-dialog-title">{title}</h2>
        <button
          aria-label="Закрыть"
          className="ui-icon-button"
          onClick={requestClose}
          type="button"
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
