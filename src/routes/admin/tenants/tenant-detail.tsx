// src/pages/admin/TenantDetail.tsx
import { useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  Phone,
  Shield,
  Trash2,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { LoadingOverlay } from "../../../components";
import { useApi } from "../../../hooks/useApi";
import { useSessionQuery } from "../../../state/session";
import { COIListItem, TenantDetail, TenantStats } from "../../../types";

export default function TenantDetailPage() {
  const { id } = useParams({ from: "/admin/tenants/$id" }) as { id: string };
  const { data: me } = useSessionQuery({ enabled: true });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const {
    data: tenant,
    loading: loadingTenant,
    execute: fetchTenant,
  } = useApi<TenantDetail>(`/tenants/${id}`, {
    showErrorToast: true,
  });

  const {
    data: stats,
    loading: loadingStats,
    execute: fetchStats,
  } = useApi<TenantStats>(`/tenants/${id}/stats`, {
    showErrorToast: true,
  });

  const {
    data: cois,
    loading: loadingCois,
    execute: fetchCois,
  } = useApi<COIListItem[]>(`/tenants/${id}/cois`, {
    showErrorToast: true,
  });

  const {
    execute: updateTenant,
    loading: updatingTenant,
  } = useApi(`/tenants/${id}`, {
    showSuccessToast: true,
    successMessage: "Tenant updated",
    showErrorToast: true,
  });

  const {
    execute: deleteTenant,
    loading: deletingTenant,
  } = useApi(`/tenants/${id}`, {
    showSuccessToast: true,
    successMessage: "Tenant deleted",
    showErrorToast: true,
  });

  const {
    execute: sendReminder,
    loading: sendingReminder,
  } = useApi(`/tenants/${id}/send-reminder`, {
    showSuccessToast: true,
    successMessage: "Reminder sent",
    showErrorToast: true,
  });

  useEffect(() => {
    fetchTenant();
    fetchStats();
    fetchCois();
  }, [fetchTenant, fetchStats, fetchCois]);

  const isLoading = loadingTenant || loadingStats || loadingCois;

  if (isLoading) return <LoadingOverlay />;

  if (!tenant) {
    return (
      <div className="card p-8 flex flex-col items-center text-center gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h2 className="text-xl font-semibold">Tenant not found</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          The tenant you are looking for does not exist or you do not have
          access to it.
        </p>
        <a href="/admin/tenants" className="btn btn-primary mt-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Tenants
        </a>
      </div>
    );
  }

  const coiList = cois ?? [];
  const canDeleteTenant =
    me?.role === "ACCOUNT_OWNER" ||
    me?.role === "PORTFOLIO_MANAGER" ||
    me?.role === "PROPERTY_MANAGER";
  const canUploadTenantCOI =
    me?.role === "ACCOUNT_OWNER" ||
    me?.role === "PORTFOLIO_MANAGER" ||
    me?.role === "PROPERTY_MANAGER";

  const handleUpdateContact = async () => {
    const email =
      window.prompt("Contact email:", tenant.contactEmail) ||
      tenant.contactEmail;
    const phone =
      window.prompt(
        "Contact phone (optional):",
        tenant.contactPhone || ""
      ) || undefined;

    try {
      await updateTenant({
        method: "PATCH",
        body: JSON.stringify({
          contactEmail: email,
          contactPhone: phone,
        }),
      });
      fetchTenant();
    } catch {
      // handled by useApi
    }
  };

  const handleSendReminder = async () => {
    const message =
      window.prompt(
        "Optional message to include in the COI reminder:"
      ) || undefined;

    try {
      await sendReminder({
        method: "POST",
        body: JSON.stringify({ message }),
      });
    } catch {
      // handled by useApi
    }
  };

  const handleDeleteTenant = async () => {
    if (!canDeleteTenant) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this tenant? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await deleteTenant({ method: "DELETE" });
      window.location.href = "/admin/tenants";
    } catch {
      // handled by useApi
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (window.location.href = "/admin/tenants")}
            className="btn btn-ghost btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {tenant.businessName}
            </h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Unit {tenant.unitNumber}
            </p>
          </div>
        </div>
        {stats && (
          <div className="text-right text-sm text-neutral-600 dark:text-neutral-400">
            <div>
              Total COIs:{" "}
              <span className="font-semibold">{stats.totalCOIs}</span>
            </div>
            <div>
              Active:{" "}
              <span className="font-semibold">{stats.activeCOIs}</span>
            </div>
            <div>
              Expired:{" "}
              <span className="font-semibold text-red-600">
                {stats.expiredCOIs}
              </span>
            </div>
            <div>
              Pending:{" "}
              <span className="font-semibold text-amber-600">
                {stats.pendingCOIs}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Profile */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-brand" />
              Tenant Profile
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-neutral-500" />
                <span>{tenant.contactEmail}</span>
              </div>
              {tenant.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-neutral-500" />
                  <span>{tenant.contactPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-neutral-500" />
                <span>Unit: {tenant.unitNumber}</span>
              </div>
              {tenant.leaseStartDate && (
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    Lease:{" "}
                    {format(
                      new Date(tenant.leaseStartDate),
                      "MMM dd, yyyy"
                    )}{" "}
                    {tenant.leaseEndDate &&
                      `– ${format(
                        new Date(tenant.leaseEndDate),
                        "MMM dd, yyyy"
                      )}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: COIs + Danger zone */}
        <div className="space-y-6">
          <div className="card p-6 space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand" />
              COIs
            </h2>
            {canUploadTenantCOI && (
              <div className="flex justify-end">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <Upload className="h-4 w-4" />
                  Upload COI for Tenant
                </button>
              </div>
            )}
            {coiList.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No certificates found for this tenant.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {coiList.map((coi) => (
                  <li
                    key={coi.id}
                    className="flex items-center justify-between border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2"
                  >
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <span>{coi.building.name}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800">
                          {coi.status}
                        </span>
                      </div>
                      {coi.insuredName && (
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                          Insured: {coi.insuredName}
                        </div>
                      )}
                      <div className="text-xs text-neutral-500">
                        {coi.effectiveDate && (
                          <>
                            Effective{" "}
                            {new Date(
                              coi.effectiveDate
                            ).toLocaleDateString()}
                          </>
                        )}
                        {coi.effectiveDate && coi.expirationDate && " – "}
                        {coi.expirationDate && (
                          <>
                            Expires{" "}
                            {new Date(
                              coi.expirationDate
                            ).toLocaleDateString()}
                          </>
                        )}
                      </div>
                      {coi.files && coi.files.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2 text-xs">
                          {coi.files.map((file) => (
                            <a
                              key={file.id}
                              href={file.fileUrl || file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            >
                              <FileText className="h-3 w-3" />
                              <span>{file.fileName || file.kind || "File"}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-6 space-y-3 border border-red-200 dark:border-red-800">
            <h2 className="text-sm font-semibold text-red-600 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Danger Zone
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Sensitive actions affecting this tenant.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleUpdateContact}
                className="btn btn-ghost btn-sm w-full justify-start"
                disabled={updatingTenant}
              >
                Update Contact Info
              </button>
              <button
                onClick={handleSendReminder}
                className="btn btn-ghost btn-sm w-full justify-start"
                disabled={sendingReminder}
              >
                Send COI Reminder
              </button>
              {canDeleteTenant && (
                <button
                  onClick={handleDeleteTenant}
                  className="btn btn-outline btn-sm w-full justify-start text-red-600 border-red-300"
                  disabled={deletingTenant}
                >
                  Delete Tenant
                </button>
              )}
            </div>
          </div>
        </div>

      {isUploadModalOpen && canUploadTenantCOI && (
        <UploadTenantCoiModal
          tenantId={tenant.id}
          buildingId={tenant.buildingId}
          onClose={() => setIsUploadModalOpen(false)}
          onUploaded={() => {
            fetchCois();
            fetchStats();
          }}
        />
      )}
      </div>
    </div>
  );
}

function UploadTenantCoiModal({
  tenantId,
  buildingId,
  onClose,
  onUploaded,
}: {
  tenantId: string;
  buildingId: string;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const { execute: uploadCoi, loading } = useApi(
    `/tenants/${tenantId}/upload-coi`,
    {
      showSuccessToast: true,
      successMessage: "COI uploaded successfully",
      showErrorToast: true,
    }
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem(
      "file"
    ) as HTMLInputElement | null;
    const expirationInput = form.elements.namedItem(
      "expirationDate"
    ) as HTMLInputElement | null;

    const file = fileInput?.files?.[0];
    const expirationDate = expirationInput?.value;
    if (!file || !expirationDate) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("expirationDate", expirationDate);
    formData.append("buildingId", buildingId);

    try {
      await uploadCoi({
        method: "POST",
        body: formData,
      });
      onUploaded();
      onClose();
    } catch {
      // handled by useApi toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold">Upload COI for Tenant</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Expiration Date *
            </label>
            <input
              name="expirationDate"
              type="date"
              className="field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              COI PDF *
            </label>
            <input
              name="file"
              type="file"
              accept="application/pdf"
              className="field"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
