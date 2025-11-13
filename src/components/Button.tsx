// src/components/Button.tsx
import { clsx } from "clsx";
import { ComponentProps, forwardRef, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "success";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends Omit<ComponentProps<"button">, "color"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  rounded?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1.5 text-xs rounded-lg",
  sm: "px-3 py-2 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-5 py-3 text-base rounded-xl",
  xl: "px-6 py-4 text-lg rounded-2xl",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500/40",
  secondary:
    "bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-500/40 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
  ghost:
    "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500/20",
  outline:
    "bg-transparent border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:ring-gray-500/20",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-xl focus:ring-red-500/40",
  success:
    "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-xl focus:ring-green-500/40",
};

const Spinner = ({ size = "md" }: { size?: ButtonSize }) => {
  const spinnerSize = {
    xs: "h-3 w-3",
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-6 w-6",
  }[size];

  return (
    <svg
      viewBox="0 0 24 24"
      className={clsx(spinnerSize, "animate-spin")}
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 018-8"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth,
      loading,
      loadingText,
      leftIcon,
      rightIcon,
      rounded,
      children,
      type,
      disabled,
      ...props
    },
    ref
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        aria-busy={loading || undefined}
        aria-live={loading ? "polite" : undefined}
        disabled={isDisabled}
        className={clsx(
          "inline-flex select-none items-center justify-center gap-2 font-bold transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 transform",
          "hover:-translate-y-0.5 active:translate-y-0",
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && "w-full",
          rounded && "!rounded-full",
          isDisabled && "opacity-50 cursor-not-allowed hover:translate-y-0",
          className
        )}
        {...props}
      >
        {loading && <Spinner size={size} />}
        {loading ? (
          loadingText ?? children
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

export default Button;
