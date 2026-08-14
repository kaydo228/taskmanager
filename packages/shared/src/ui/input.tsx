import { useId, type InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label: string;
};

export function Input({ error, id, label, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <label className="ui-field" htmlFor={inputId}>
      <span>{label}</span>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        id={inputId}
        {...props}
      />
      {error ? <small id={errorId}>{error}</small> : null}
    </label>
  );
}
