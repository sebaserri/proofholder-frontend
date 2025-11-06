// src/hooks/useMutationToast.ts
import {
  useMutation,
  type MutationFunction,
  type MutationFunctionContext,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useToast } from "../ui/toast/ToastProvider";

export type ToastMeta = {
  success?: { title?: string; description?: string };
  error?: { title?: string; description?: string };
};

/**
 * Wrapper de useMutation con toasts integrados (React Query v5)
 * - Acepta un MutationFunction que SIEMPRE devuelve Promise<TData>
 * - Tipos de callbacks con la signatura nueva (4 args): (data, variables, onMutateResult, context)
 */
export function useMutationToast<
  TData,
  TError = unknown,
  TVariables = void,
  TContext extends MutationFunctionContext = MutationFunctionContext
>(
  mutationFn: MutationFunction<TData, TVariables>,
  opts?: UseMutationOptions<TData, TError, TVariables, TContext> & ToastMeta
) {
  const { show } = useToast();

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    // Spread primero para permitir override desde opts, y luego encadenamos callbacks
    ...opts,
    onSuccess: (data, variables, onMutateResult, context) => {
      if (opts?.success) {
        show({
          variant: "success",
          title: opts.success.title ?? "Listo",
          description: opts.success.description,
        });
      }
      // Forward al callback del caller respetando signatura v5 (4 args)
      opts?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (err, variables, onMutateResult, context) => {
      const message =
        (err as any)?.message ??
        (typeof (err as any)?.data === "string"
          ? (err as any).data
          : "Ocurrió un error");
      show({
        variant: "error",
        title: opts?.error?.title ?? "Error",
        description: opts?.error?.description ?? String(message),
      });
      opts?.onError?.(err as TError, variables, onMutateResult, context);
    },
  });
}
