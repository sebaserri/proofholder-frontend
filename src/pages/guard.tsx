import RequireRole from "../auth/RequireRole";

export default function GuardPage() {
  return (
    <RequireRole anyOf={["GUARD", "ADMIN"]}>
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Área de Guard</h1>
        <p className="text-sm text-neutral-500">
          Controles y reportes para <b>GUARD</b> (y <b>ADMIN</b>).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border p-4">Accesos</div>
          <div className="rounded-2xl border p-4">Alertas</div>
        </div>
      </div>
    </RequireRole>
  );
}
