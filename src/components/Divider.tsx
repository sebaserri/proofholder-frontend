// src/components/Divider.tsx
import { clsx } from "clsx";
import { ComponentProps, ReactNode } from "react";

export interface DividerProps extends ComponentProps<"div"> {
  label?: ReactNode;
  orientation?: "horizontal" | "vertical";
  variant?: "solid" | "dashed" | "dotted";
}

export function Divider({
  className,
  label,
  orientation = "horizontal",
  variant = "solid",
  ...props
}: DividerProps) {
  const borderStyle = {
    solid: "border-solid",
    dashed: "border-dashed",
    dotted: "border-dotted",
  }[variant];

  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={clsx(
          "inline-block h-full w-px border-l border-gray-200 dark:border-gray-800",
          borderStyle,
          className
        )}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        className={clsx("relative flex items-center", className)}
        {...props}
      >
        <div
          className={clsx(
            "flex-1 border-t border-gray-200 dark:border-gray-800",
            borderStyle
          )}
        />
        <span className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <div
          className={clsx(
            "flex-1 border-t border-gray-200 dark:border-gray-800",
            borderStyle
          )}
        />
      </div>
    );
  }

  return (
    <hr
      className={clsx(
        "border-0 border-t border-gray-200 dark:border-gray-800",
        borderStyle,
        className
      )}
      {...props}
    />
  );
}

export default Divider;
