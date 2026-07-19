import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export function TextInput({ error, className = "", ...props }: TextInputProps) {
  return (
    <input
      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 ${
        error
          ? "border-red-300 focus:border-red-400 focus:ring-red-200"
          : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
      } ${className}`}
      aria-invalid={error || undefined}
      {...props}
    />
  );
}

type TextAreaProps = InputHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export function TextArea({ error, className = "", ...props }: TextAreaProps) {
  return (
    <textarea
      className={`min-h-24 w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 ${
        error
          ? "border-red-300 focus:border-red-400 focus:ring-red-200"
          : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
      } ${className}`}
      aria-invalid={error || undefined}
      {...props}
    />
  );
}

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
};

export function SelectInput({ error, className = "", children, ...props }: SelectInputProps) {
  return (
    <select
      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 ${
        error
          ? "border-red-300 focus:border-red-400 focus:ring-red-200"
          : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
      } ${className}`}
      aria-invalid={error || undefined}
      {...props}
    >
      {children}
    </select>
  );
}

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: string;
};

export function Checkbox({ label, description, id, className = "", ...props }: CheckboxProps) {
  return (
    <label htmlFor={id} className={`flex cursor-pointer gap-3 ${className}`}>
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        {...props}
      />
      <span>
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        {description ? (
          <span className="block text-xs text-slate-500">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
