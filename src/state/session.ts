import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchApi } from "../lib/api";
import { useApi, UseApiOptions } from "../hooks/useApi";

// Roles alineados con el backend (Prisma UserRole)
export type Role =
  | "ACCOUNT_OWNER"
  | "PORTFOLIO_MANAGER"
  | "PROPERTY_MANAGER"
  | "BUILDING_OWNER"
  | "TENANT"
  | "VENDOR"
  | "GUARD";

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
  organizationId?: string | null;
  vendorId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  // Campo de conveniencia para mostrar nombre en UI
  name?: string;
  // Truthy si el email está verificado; con el nuevo backend sólo usuarios verificados pueden loguearse
  emailVerifiedAt?: string | null;
};

function normalizeSessionUser(raw: any): SessionUser {
  if (!raw) {
    throw new Error("Invalid user payload");
  }

  const firstName = raw.firstName ?? null;
  const lastName = raw.lastName ?? null;
  const nameFromPayload = raw.name as string | undefined;

  const name =
    nameFromPayload ||
    [firstName, lastName].filter((p) => typeof p === "string" && p).join(" ") ||
    undefined;

  return {
    id: String(raw.id),
    email: String(raw.email),
    role: raw.role as Role,
    organizationId: raw.organizationId ?? null,
    vendorId: raw.vendorId ?? null,
    firstName,
    lastName,
    phone: raw.phone ?? null,
    name,
    // En el backend nuevo, sólo usuarios con email verificado pueden iniciar sesión,
    // así que si no viene el campo lo consideramos verificado para ocultar el banner.
    emailVerifiedAt: (raw.emailVerifiedAt as string | null | undefined),
  };
}

type ApiRequestOptions = {
  endpoint?: string;
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  csrf?: boolean;
};

type ApiMutationResult<TPayload, TResult> = {
  mutate: (
    payload: TPayload,
    opts?: {
      onSuccess?: (result: TResult) => void;
      onError?: (error: any) => void;
    }
  ) => void;
  mutateAsync: (payload: TPayload) => Promise<TResult>;
  isPending: boolean;
  isSuccess: boolean;
  error: Error | null;
};

function useApiMutation<TPayload, TResult>(
  endpoint: string,
  options: {
    makeRequest: (payload: TPayload) => ApiRequestOptions;
    useApiOptions?: UseApiOptions;
    onSuccess?: (result: TResult, payload: TPayload) => void;
  }
): ApiMutationResult<TPayload, TResult> {
  const { makeRequest, useApiOptions, onSuccess } = options;
  const { execute, loading, error } = useApi<TResult>(endpoint, useApiOptions);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutateAsync = async (payload: TPayload) => {
    setIsSuccess(false);
    try {
      const request = makeRequest(payload) || {};
      const { endpoint: overrideEndpoint, ...rest } = request;
      const result = await execute(
        overrideEndpoint ? { endpoint: overrideEndpoint, ...rest } : rest
      );
      setIsSuccess(true);
      onSuccess?.(result, payload);
      return result;
    } catch (err) {
      setIsSuccess(false);
      throw err;
    }
  };

  const mutate = (
    payload: TPayload,
    opts?: {
      onSuccess?: (result: TResult) => void;
      onError?: (error: any) => void;
    }
  ) => {
    mutateAsync(payload)
      .then((result) => {
        opts?.onSuccess?.(result);
      })
      .catch((err) => {
        opts?.onError?.(err);
      });
  };

  return {
    mutate,
    mutateAsync,
    isPending: loading,
    isSuccess,
    error,
  };
}

/**
 * ❗️No llamar al backend por defecto.
 * Usá `useSessionQuery({ enabled: true })` SOLO en rutas protegidas (/dashboard).
 */
export function useSessionQuery(opts?: { enabled?: boolean }) {
  return useQuery<SessionUser | null>({
    queryKey: ["me"],
    enabled: opts?.enabled ?? false, // <- deshabilitado por defecto
    queryFn: async () => {
      try {
        const result = await fetchApi<{ ok: true; user: any }>("/auth/me");
        return normalizeSessionUser(result.user);
      } catch (err: any) {
        if (err.status === 401 || err.status === 403) {
          return null;
        }
        throw err;
      }
    },
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useApiMutation<{ email: string; password: string }, { ok: true; user: any }>(
    "/auth/login",
    {
      makeRequest: (payload) => ({
        method: "POST",
        body: payload,
      }),
      onSuccess: (result) => {
        const normalized = normalizeSessionUser(result.user);
        // Opcionalmente seteamos el cache de 'me' para evitar un /auth/me inmediato
        qc.setQueryData<SessionUser | null>(["me"], normalized);
      },
    }
  );
}

export function useRegister() {
  const qc = useQueryClient();
  return useApiMutation<
    {
      email: string;
      password: string;
      role: Role;
      firstName?: string;
      lastName?: string;
      phone?: string;
      invited?: boolean;
    },
    { ok: true; user: any }
  >("/auth/register", {
    makeRequest: (payload) => ({
      method: "POST",
      body: payload,
    }),
    onSuccess: (result) => {
      const normalized = normalizeSessionUser(result.user);
      qc.setQueryData<SessionUser | null>(["me"], normalized);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useApiMutation<void, { ok: true }>("/auth/logout", {
    makeRequest: () => ({
      method: "POST",
    }),
    onSuccess: () => {
      qc.removeQueries({ queryKey: ["me"] });
    },
  });
}

export function useRefresh() {
  const qc = useQueryClient();
  return useApiMutation<void, { ok: true; user: any }>("/auth/refresh", {
    makeRequest: () => ({
      method: "POST",
    }),
    onSuccess: (result) => {
      const normalized = normalizeSessionUser(result.user);
      qc.setQueryData<SessionUser | null>(["me"], normalized);
    },
  });
}

export function useForgotPassword() {
  return useApiMutation<string, { ok: true }>("/auth/forgot-password", {
    makeRequest: (email) => ({
      method: "POST",
      body: { email },
      csrf: false,
    }),
  });
}

export function useResetPassword() {
  return useApiMutation<{ token: string; password: string }, { ok: true }>(
    "/auth/reset-password",
    {
      makeRequest: (payload) => ({
        method: "POST",
        body: payload,
        csrf: false,
      }),
    }
  );
}

export function useVerifyEmail() {
  return useApiMutation<string, { ok: true }>("/auth/verify-email", {
    makeRequest: (token) => ({
      method: "POST",
      body: { token },
      csrf: false,
    }),
  });
}

export function useResendVerification() {
  return useApiMutation<string, { ok: true }>("/auth/resend-verification", {
    makeRequest: (email) => ({
      method: "POST",
      body: { email },
      csrf: false,
    }),
  });
}
