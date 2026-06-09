import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  htmlFor?: string;
}

/** Поле ввода с подписью и ошибкой */
export function Input({
  className,
  label,
  error,
  id,
  htmlFor,
  ...props
}: InputProps) {
  const inputId = id ?? htmlFor;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-600">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-300 focus:border-energy focus:outline-none focus:ring-1 focus:ring-energy",
          error && "border-error",
          className,
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
