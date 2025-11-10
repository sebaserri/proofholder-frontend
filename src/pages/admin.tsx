import RequireRole from "../auth/RequireRole";

export default function AdminPage() {
  return (
    <RequireRole anyOf={["ADMIN"]}>
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-neutral-500">
          Contenido visible únicamente para usuarios con rol ADMIN.
        </p>
      </div>
    </RequireRole>
  );
}
