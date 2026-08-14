import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

export type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

type DropdownProps<T extends string> = {
  label: string;
  onChange: (value: T) => void;
  options: readonly DropdownOption<T>[];
  value: T;
  variant?: 'field' | 'compact';
};

export function Dropdown<T extends string>({
  label,
  onChange,
  options,
  value,
  variant = 'field',
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, []);

  function closeOnEscape(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape') return;
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div
      className={`ui-dropdown ui-dropdown--${variant}`}
      onKeyDown={closeOnEscape}
      ref={rootRef}
    >
      {variant === 'field' ? (
        <span className="ui-dropdown__label" id={`${generatedId}-label`}>
          {label}
        </span>
      ) : null}
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`${label}: ${selected?.label ?? ''}`}
        className="ui-dropdown__trigger"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <span>{selected?.label}</span>
        <span aria-hidden="true" className="ui-dropdown__chevron" />
      </button>
      {open ? (
        <div aria-label={label} className="ui-dropdown__menu" role="listbox">
          {options.map((option) => (
            <button
              aria-selected={option.value === value}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              role="option"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
