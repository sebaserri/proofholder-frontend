// src/components/Input.tsx
import { clsx } from "clsx";
import {
  ComponentProps,
  forwardRef,
  ReactNode,
  useId,
  useState,
} from "react";

export type InputVariant = "default" | "filled" | "outline";
export type InputSize = "sm" | "md" | "lg";
export type InputState = "default" | "error" | "success";

export interface InputProps extends Omit<ComponentProps<"input">, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: InputVariant;
  size?: InputSize;
  state?: InputState;
  fullWidth?: boolean;
}

const sizeClasses: Record<InputSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-sm",
  lg: "px-5 py-4 text-base",
};

const variantClasses: Record<InputVariant, string> = {
  default:
    "border-2 border-gray-300 bg-white focus:border-blue-500 hover:border-gray-400",
  filled:
    "border-2 border-transparent bg-gray-100 focus:bg-white focus:border-blue-500 hover:bg-gray-200",
  outline:
    "border-2 border-gray-300 bg-transparent focus:border-blue-500 hover:border-gray-400",
};

const stateClasses: Record<InputState, string> = {
  default: "",
  error:
    "!border-red-500 focus:!border-red-500 focus:ring-red-500/20 hover:!border-red-600",
  success:
    "!border-green-500 focus:!border-green-500 focus:ring-green-500/20 hover:!border-green-600",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    label,
    hint,
    error,
    leftIcon,
    rightIcon,
    variant = "default",
    size = "md",
    state = "default",
    fullWidth = true,
    disabled,
    required,
    id: providedId,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const [isFocused, setIsFocused] = useState(false);

  const effectiveState = error ? "error" : state;

  const inputClasses = clsx(
    "w-full rounded-xl font-medium transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "placeholder:text-gray-400",
    sizeClasses[size],
    variantClasses[variant],
    stateClasses[effectiveState],
    leftIcon && "pl-11",
    rightIcon && "pr-11",
    !fullWidth && "inline-flex",
    className
  );

  const containerClasses = clsx(
    "relative group",
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
          <div
            className={clsx(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none",
              isFocused
                ? "text-blue-600"
                : error
                  ? "text-red-500"
                  : "text-gray-400"
            )}
          >
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={id}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : hint ? hintId : undefined
          }
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={inputClasses}
          {...props}
        />

        {rightIcon && (
          <div
            className={clsx(
              "absolute right-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none",
              isFocused
                ? "text-blue-600"
                : error
                  ? "text-red-500"
                  : "text-gray-400"
            )}
          >
            {rightIcon}
          </div>
        )}
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
});

export default Input;
