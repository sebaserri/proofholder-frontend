// src/components/Card.tsx
import { clsx } from "clsx";
import { ComponentProps, forwardRef, ReactNode } from "react";

type CardVariant = "default" | "bordered" | "elevated" | "glass";
type CardTone = "default" | "info" | "success" | "warning" | "danger";
type CardPadding = "none" | "sm" | "md" | "lg" | "xl";

export interface CardProps extends ComponentProps<"div"> {
  variant?: CardVariant;
  tone?: CardTone;
  padding?: CardPadding;
  interactive?: boolean;
  hoverable?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  headerClassName?: string;
  footerClassName?: string;
}

const variantClasses: Record<CardVariant, string> = {
  default:
    "bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 shadow-sm",
  bordered:
    "bg-white dark:bg-neutral-900 border-2 border-gray-300 dark:border-gray-700",
  elevated:
    "bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 shadow-lg",
  glass:
    "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-gray-200/70 dark:border-gray-800/70 shadow-lg",
};

const toneClasses: Record<CardTone, string> = {
  default: "",
  info: "!bg-sky-50/70 dark:!bg-sky-950/20 !border-sky-200/70 dark:!border-sky-800/60",
  success:
    "!bg-emerald-50/70 dark:!bg-emerald-950/20 !border-emerald-200/70 dark:!border-emerald-800/60",
  warning:
    "!bg-amber-50/70 dark:!bg-amber-950/20 !border-amber-200/70 dark:!border-amber-800/60",
  danger:
    "!bg-red-50/70 dark:!bg-red-950/20 !border-red-200/70 dark:!border-red-800/60",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

// Compound component types
interface CardHeaderProps extends ComponentProps<"div"> {}
interface CardBodyProps extends ComponentProps<"div"> {}
interface CardFooterProps extends ComponentProps<"div"> {}

// Main Card component
const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    className,
    variant = "default",
    tone = "default",
    padding = "md",
    interactive = false,
    hoverable = false,
    header,
    footer,
    headerClassName,
    footerClassName,
    children,
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={clsx(
        "rounded-2xl transition-all duration-200",
        variantClasses[variant],
        tone !== "default" && toneClasses[tone],
        paddingClasses[padding],
        (interactive || hoverable) &&
          "hover:shadow-xl hover:-translate-y-1 focus-within:shadow-xl focus-within:-translate-y-1 cursor-pointer",
        className
      )}
      {...props}
    >
      {header && (
        <div
          className={clsx(
            "mb-4 pb-4 border-b border-gray-200 dark:border-gray-800",
            padding === "none" && "px-6 pt-6",
            headerClassName
          )}
        >
          {header}
        </div>
      )}

      {children}

      {footer && (
        <div
          className={clsx(
            "mt-4 pt-4 border-t border-gray-200 dark:border-gray-800",
            padding === "none" && "px-6 pb-6",
            footerClassName
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
});

// Compound components
const CardHeader = function CardHeader({
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={clsx(
        "mb-4 pb-4 border-b border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardBody = function CardBody({
  className,
  children,
  ...props
}: CardBodyProps) {
  return (
    <div className={clsx(className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter = function CardFooter({
  className,
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={clsx(
        "mt-4 pt-4 border-t border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Create the compound component with proper typing
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});

export default Card;
