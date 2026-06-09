import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

/** Выпадающий список */
export function Select({
  className,
  label,
  error,
  id,
  options,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink-600">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm focus:border-energy focus:outline-none focus:ring-1 focus:ring-energy",
          error && "border-error",
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
