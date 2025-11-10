import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, ErrorBanner, PageTitle } from "../components";
import { useResendVerification } from "../state/session";

export default function ProfilePage() {
  const qc = useQueryClient();
  const me = qc.getQueryData<any>(["me"]);
  const resend = useResendVerification();
  const [sent, setSent] = useState(false);

  const canResend = me?.email && me?.emailVerified === false;

  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-6 px-2">
      <PageTitle subtitle="Administrá tu perfil y verificación.">
        Perfil
      </PageTitle>

      <Card padding="lg" className="space-y-4">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">
              Nombre
            </dt>
            <dd className="mt-1 text-sm">{me?.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">
              Email
            </dt>
            <dd className="mt-1 text-sm">{me?.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">
              Rol
            </dt>
            <dd className="mt-1 text-sm">{me?.role || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">
              Vendor ID
            </dt>
            <dd className="mt-1 text-sm">{me?.vendorId || "—"}</dd>
          </div>
        </dl>

        {me?.emailVerified === false ? (
          <ErrorBanner
            variant="warning"
            title="Email no verificado"
            msg="Verificá tu email para acceder a todas las funciones."
          />
        ) : (
          <ErrorBanner
            variant="success"
            title="Email verificado"
            msg="Tu email ya está verificado."
          />
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/dashboard" className="btn btn-ghost">
            Volver al panel
          </Link>
          {canResend && (
            <Button
              onClick={async () => {
                await resend.mutateAsync(me.email);
                setSent(true);
              }}
              loading={resend.isPending}
              loadingText="Enviando…"
              disabled={sent}
            >
              {sent ? "Enviado" : "Reenviar verificación"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
