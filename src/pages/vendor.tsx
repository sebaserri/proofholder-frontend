import RequireRole from "../auth/RequireRole";

export default function VendorPage() {
  return (
    <RequireRole anyOf={["VENDOR", "ADMIN"]}>
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Área de Vendor
        </h1>
        <p className="text-sm text-neutral-500">
          Contenido visible para usuarios con rol <b>VENDOR</b> o <b>ADMIN</b>.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border p-4">Resumen de órdenes</div>
          <div className="rounded-2xl border p-4">Inventario</div>
        </div>
      </div>
    </RequireRole>
  );
}
