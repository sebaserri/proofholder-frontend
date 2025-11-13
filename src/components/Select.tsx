// src/components/Select.tsx
import { clsx } from "clsx";
import {
  ComponentProps,
  forwardRef,
  ReactNode,
  useId,
} from "react";

export type SelectSize = "sm" | "md" | "lg";
export type SelectVariant = "default" | "filled" | "outline";

export interface SelectProps
  extends Omit<ComponentProps<"select">, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  variant?: SelectVariant;
  size?: SelectSize;
  fullWidth?: boolean;
  placeholder?: string;
}

const sizeClasses: Record<SelectSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-sm",
  lg: "px-5 py-4 text-base",
};

const variantClasses: Record<SelectVariant, string> = {
  default:
    "border-2 border-gray-300 bg-white focus:border-blue-500 hover:border-gray-400",
  filled:
    "border-2 border-transparent bg-gray-100 focus:bg-white focus:border-blue-500 hover:bg-gray-200",
  outline:
    "border-2 border-gray-300 bg-transparent focus:border-blue-500 hover:border-gray-400",
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      className,
      label,
      hint,
      error,
      leftIcon,
      variant = "default",
      size = "md",
      fullWidth = true,
      disabled,
      required,
      placeholder,
      id: providedId,
      children,
      ...props
    },
    ref
  ) {
    const generatedId = useId();
    const id = providedId || generatedId;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;

    const selectClasses = clsx(
      "w-full rounded-xl font-medium transition-all duration-200 appearance-none",
      "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "bg-[right_0.75rem_center] bg-no-repeat",
      "bg-[length:1.25rem] pr-10",
      sizeClasses[size],
      variantClasses[variant],
      error &&
        "!border-red-500 focus:!border-red-500 focus:ring-red-500/20 hover:!border-red-600",
      leftIcon && "pl-11",
      !fullWidth && "inline-flex",
      className
    );

    const containerClasses = clsx(
      "relative",
      fullWidth ? "w-full" : "inline-flex"
    );

    return (
      <div className={fullWidth ? "w-full" : "inline-flex"}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className={containerClasses}>
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              {leftIcon}
            </div>
          )}

          <select
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : hint ? hintId : undefined
            }
            className={selectClasses}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
        </div>

        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium flex items-center gap-1"
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

        {!error && hint && (
          <p
            id={hintId}
            className="text-sm text-gray-500 dark:text-gray-400 mt-2"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

export default Select;
