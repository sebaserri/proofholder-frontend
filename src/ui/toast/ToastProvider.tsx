import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";
export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
  action?: { label: string; onClick: () => void };
};

type Ctx = {
  show: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider/>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) {
      window.clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = crypto.randomUUID();
      const toast: Toast = {
        id,
        variant: "default",
        duration: 4000,
        ...t,
      };
      setToasts((list) => [...list, toast]);
      if (toast.duration && toast.duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), toast.duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  const clear = useCallback(() => {
    setToasts([]);
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current.clear();
  }, []);

  const value = useMemo<Ctx>(
    () => ({ show, dismiss, clear }),
    [show, dismiss, clear]
  );

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onClose={dismiss} />
    </ToastCtx.Provider>
  );
}

function Toaster({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 sm:inset-auto sm:right-4 sm:top-4 sm:w-[360px] sm:items-stretch">
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ t, onClose }: { t: Toast; onClose: () => void }) {
  const color = {
    default:
      "border-neutral-200 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100",
    success:
      "border-green-200 bg-green-50 text-green-800 dark:border-green-900/40 dark:bg-green-950/50 dark:text-green-200",
    error:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/50 dark:text-red-200",
    warning:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/50 dark:text-amber-200",
    info: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/50 dark:text-sky-200",
  }[t.variant || "default"];

  return (
    <div
      role="status"
      className={clsx(
        "pointer-events-auto mx-2 flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ring-1 ring-black/5 backdrop-blur",
        "animate-in fade-in zoom-in-95 duration-150",
        color
      )}
    >
      <div className="min-w-0">
        {t.title && <p className="font-medium leading-5">{t.title}</p>}
        {t.description && (
          <p className="mt-0.5 text-sm opacity-90">{t.description}</p>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {t.action && (
          <button
            className="rounded-lg px-2 py-1 text-sm underline-offset-2 hover:underline"
            onClick={t.action.onClick}
          >
            {t.action.label}
          </button>
        )}
        <button
          aria-label="Cerrar"
          className="rounded-lg p-1 opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
