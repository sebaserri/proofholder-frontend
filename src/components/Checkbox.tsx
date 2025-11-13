// src/components/Checkbox.tsx
import { clsx } from "clsx";
import { ComponentProps, forwardRef, ReactNode, useId } from "react";

export interface CheckboxProps
  extends Omit<ComponentProps<"input">, "type" | "size"> {
  label?: ReactNode;
  description?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      className,
      label,
      description,
      error,
      size = "md",
      disabled,
      id: providedId,
      ...props
    },
    ref
  ) {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const descId = `${id}-desc`;

    const checkbox = (
      <input
        ref={ref}
        type="checkbox"
        id={id}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={
          error ? errorId : description ? descId : undefined
        }
        className={clsx(
          sizeClasses[size],
          "rounded border-gray-300 text-blue-600 transition-all",
          "focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2",
          "hover:border-blue-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error &&
            "border-red-500 focus:ring-red-500/20 hover:border-red-600",
          className
        )}
        {...props}
      />
    );

    if (!label && !description) {
      return checkbox;
    }

    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5">{checkbox}</div>
        <div className="flex-1">
          {label && (
            <label
              htmlFor={id}
              className={clsx(
                "block font-medium select-none cursor-pointer",
                size === "sm" && "text-sm",
                size === "md" && "text-sm",
                size === "lg" && "text-base",
                disabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              id={descId}
              className="text-sm text-gray-500 dark:text-gray-400 mt-1"
            >
              {description}
            </p>
          )}
          {error && (
            <p
              id={errorId}
              className="text-sm text-red-600 dark:text-red-400 mt-1 font-medium flex items-center gap-1"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

export default Checkbox;
