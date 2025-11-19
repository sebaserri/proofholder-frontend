// src/pages/admin/VendorDetail.tsx
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
  Users,
  XCircle,
} from "lucide-react";
import { useEffect } from "react";
import { LoadingOverlay } from "../../../components";
import { useApi } from "../../../hooks/useApi";
import { useSessionQuery } from "../../../state/session";
import {
  ApproveVendorDto,
  NotifyVendorDto,
  RejectVendorDto,
  Vendor,
  VendorAuthorization,
  VendorStats,
} from "../../../types";
import { COIListItem } from "../../../types/coi.types";

export default function VendorDetailPage() {
  const { id } = useParams({ from: "/admin/vendors/$id" }) as { id: string };
  const { data: me } = useSessionQuery({ enabled: true });

  const {
    data: vendor,
    loading: loadingVendor,
    execute: fetchVendor,
  } = useApi<Vendor>(`/vendors/${id}`, { showErrorToast: true });

  const {
    data: authorizations,
    loading: loadingAuth,
    execute: fetchAuthorizations,
  } = useApi<VendorAuthorization[]>(`/vendors/me/authorizations`, {
    showErrorToast: true,
  });

  const {
    data: cois,
    loading: loadingCois,
    execute: fetchCois,
  } = useApi<COIListItem[]>(`/vendors/${id}/cois`, {
    showErrorToast: true,
  });

  const {
    data: stats,
    loading: loadingStats,
    execute: fetchStats,
  } = useApi<VendorStats>(`/vendors/${id}/stats`, {
    showErrorToast: true,
  });

  // Vendor-level update/delete/notify
  const { execute: updateVendor, loading: updatingVendor } = useApi(
    `/vendors/${id}`,
    {
      showSuccessToast: true,
      successMessage: "Vendor updated",
      showErrorToast: true,
    }
  );

  const { execute: deleteVendor, loading: deletingVendor } = useApi(
    `/vendors/${id}`,
    {
      showSuccessToast: true,
      successMessage: "Vendor deleted",
      showErrorToast: true,
    }
  );

  const { execute: notifyVendor, loading: notifyingVendor } = useApi(
    `/vendors/${id}/notify`,
    {
      showSuccessToast: true,
      successMessage: "Notification sent",
      showErrorToast: true,
    }
  );

  // Per-authorization approve/reject
  const { execute: approveVendor } = useApi(`/vendors/${id}/approve`, {
    showSuccessToast: true,
    successMessage: "Vendor approved for building",
    showErrorToast: true,
  });

  const { execute: rejectVendor } = useApi(`/vendors/${id}/reject`, {
    showSuccessToast: true,
    successMessage: "Vendor rejected for building",
    showErrorToast: true,
  });

  useEffect(() => {
    fetchVendor();
    fetchAuthorizations();
    fetchCois();
    fetchStats();
  }, [fetchVendor, fetchAuthorizations, fetchCois, fetchStats]);

  const isLoading = loadingVendor || loadingAuth || loadingCois || loadingStats;

  if (isLoading) return <LoadingOverlay />;

  if (!vendor) {
    return (
      <div className="card p-8 flex flex-col items-center text-center gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h2 className="text-xl font-semibold">Vendor not found</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          The vendor you are looking for does not exist or you do not have
          access to it.
        </p>
        <a href="/admin/vendors" className="btn btn-primary mt-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Vendors
        </a>
      </div>
    );
  }

  const authList = authorizations ?? [];
  const coiList = cois ?? [];

  const canDeleteVendor = me?.role === "ACCOUNT_OWNER";

  const handleApproveAuth = async (auth: VendorAuthorization) => {
    const payload: ApproveVendorDto = { buildingId: auth.buildingId };
    try {
      await approveVendor({
        method: "POST",
        body: JSON.stringify(payload),
      });
      fetchAuthorizations();
      fetchStats();
    } catch {
      // handled by useApi
    }
  };

  const handleRejectAuth = async (auth: VendorAuthorization) => {
    const reason =
      window.prompt("Enter rejection reason (optional):") || undefined;
    const payload: RejectVendorDto = {
      buildingId: auth.buildingId,
      notes: reason,
    };
    try {
      await rejectVendor({
        method: "POST",
        body: JSON.stringify(payload),
      });
      fetchAuthorizations();
      fetchStats();
    } catch {
      // handled by useApi
    }
  };

  const handleNotify = async () => {
    if (!vendor) return;
    const message =
      window.prompt("Enter custom notification message (optional):") || "";
    const payload: NotifyVendorDto = {
      vendorId: vendor.id,
      notificationType: "CUSTOM",
      customMessage: message || undefined,
    };
    try {
      await notifyVendor({
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch {
      // handled by useApi
    }
  };

  const handleDeleteVendor = async () => {
    if (!canDeleteVendor) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this vendor? This action cannot be undone."
      )
    )
      return;
    try {
      await deleteVendor({ method: "DELETE" });
      window.location.href = "/admin/vendors";
    } catch {
      // handled by useApi
    }
  };

  const handleUpdateVendorContact = async () => {
    if (!vendor) return;
    const email = window.prompt("Contact email:", vendor.contactEmail) || "";
    const phone =
      window.prompt("Contact phone (optional):", vendor.contactPhone || "") ||
      "";
    try {
      await updateVendor({
        method: "PATCH",
        body: JSON.stringify({
          contactEmail: email || vendor.contactEmail,
          contactPhone: phone || undefined,
        }),
      });
      fetchVendor();
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
            onClick={() => (window.location.href = "/admin/vendors")}
            className="btn btn-ghost btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {vendor.legalName}
            </h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Vendor ID: <span className="font-mono text-xs">{vendor.id}</span>
            </p>
          </div>
        </div>
        {stats && (
          <div className="text-right text-sm text-neutral-600 dark:text-neutral-400">
            <div>
              Buildings:{" "}
              <span className="font-semibold">{stats.totalBuildings}</span>
            </div>
            <div>
              Active COIs:{" "}
              <span className="font-semibold">{stats.activeCOIs}</span>
            </div>
            <div>
              Compliance:{" "}
              <span className="font-semibold">
                {Math.round(stats.complianceRate * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Profile + Authorizations */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile card */}
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-brand" />
              Vendor Profile
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-neutral-500" />
                <span>{vendor.contactEmail}</span>
              </div>
              {vendor.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-neutral-500" />
                  <span>{vendor.contactPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Authorizations */}
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand" />
              Building Authorizations
            </h2>
            {authList.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No authorizations found for this vendor.
              </p>
            ) : (
              <div className="space-y-3">
                {authList.map((auth) => (
                  <div
                    key={auth.id}
                    className="flex items-start justify-between border border-neutral-200 dark:border-neutral-800 rounded-lg p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-brand" />
                        <span className="font-medium">{auth.buildingName}</span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {auth.buildingAddress}
                      </p>
                      {auth.notes && (
                        <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                          Notes: {auth.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <AuthorizationStatusBadge status={auth.status} />
                      {auth.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveAuth(auth)}
                            className="btn btn-xs btn-ghost"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectAuth(auth)}
                            className="btn btn-xs btn-ghost text-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: COIs + Danger zone */}
        <div className="space-y-6">
          {/* COIs */}
          <div className="card p-6 space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand" />
              COIs
            </h2>
            {coiList.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No certificates found for this vendor.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {coiList.map((coi) => (
                  <li
                    key={coi.id}
                    className="flex items-center justify-between border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2"
                  >
                    <div>
                      <div className="font-medium">
                        {coi.building.name} – {coi.status}
                      </div>
                      {coi.expirationDate && (
                        <div className="text-xs text-neutral-500">
                          Expires on{" "}
                          {new Date(coi.expirationDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Danger zone */}
          <div className="card p-6 space-y-3 border border-red-200 dark:border-red-800">
            <h2 className="text-sm font-semibold text-red-600 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Danger Zone
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Sensitive actions affecting this vendor.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleUpdateVendorContact}
                className="btn btn-ghost btn-sm w-full justify-start"
                disabled={updatingVendor}
              >
                Update Contact Info
              </button>
              <button
                onClick={handleNotify}
                className="btn btn-ghost btn-sm w-full justify-start"
                disabled={notifyingVendor}
              >
                Send Notification
              </button>
              {canDeleteVendor && (
                <button
                  onClick={handleDeleteVendor}
                  className="btn btn-outline btn-sm w-full justify-start text-red-600 border-red-300"
                  disabled={deletingVendor}
                >
                  Delete Vendor
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthorizationStatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; className: string; icon: typeof CheckCircle }
  > = {
    PENDING: {
      label: "Pending",
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
      icon: Clock,
    },
    APPROVED: {
      label: "Approved",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
      icon: CheckCircle,
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
      icon: XCircle,
    },
  };

  const cfg = config[status] ?? config.PENDING;
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}
