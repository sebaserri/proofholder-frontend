// src/pages/tenant/TenantPortal.tsx
import { format } from "date-fns";
import { AlertCircle, CheckCircle, Clock, FileText, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingOverlay } from "../../components";
import { useApi } from "../../hooks/useApi";
import { COIListItem } from "../../types";

export default function TenantPortalPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // My COIs - GET /tenants/my-coi
  const {
    data: cois,
    loading: loadingCois,
    execute: fetchCois,
  } = useApi<COIListItem[]>("/tenants/my-coi", {
    showErrorToast: true,
  });

  useEffect(() => {
    fetchCois();
  }, [fetchCois]);

  if (loadingCois) return <LoadingOverlay />;

  const coiList = cois ?? [];
  const pendingCois = coiList.filter((c) => c.status === "PENDING");
  const approvedCois = coiList.filter((c) => c.status === "APPROVED");
  const rejectedCois = coiList.filter((c) => c.status === "REJECTED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            My Certificates of Insurance
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Upload and track COIs for your tenancy.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsUploadOpen(true)}
        >
          <Upload className="h-4 w-4" />
          Upload COI
        </button>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Pending Review"
          count={pendingCois.length}
          icon={Clock}
          color="amber"
        />
        <StatusCard
          title="Approved"
          count={approvedCois.length}
          icon={CheckCircle}
          color="green"
        />
        <StatusCard
          title="Rejected"
          count={rejectedCois.length}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* COI list */}
      {coiList.length === 0 ? (
        <EmptyState onUploadClick={() => setIsUploadOpen(true)} />
      ) : (
        <div className="card divide-y divide-neutral-200 dark:divide-neutral-800">
          {coiList.map((coi) => (
            <COICard key={coi.id} coi={coi} />
          ))}
        </div>
      )}

      {/* Upload modal */}
      {isUploadOpen && (
        <UploadCoiModal
          onClose={() => setIsUploadOpen(false)}
          onUploaded={fetchCois}
        />
      )}
    </div>
  );
}

function StatusCard({
  title,
  count,
  icon: Icon,
  color,
}: {
  title: string;
  count: number;
  icon: any;
  color: "amber" | "green" | "red";
}) {
  const colorClasses = {
    amber:
      "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  };

  return (
    <div className="card p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {title}
        </p>
        <p className="text-2xl font-bold mt-1">{count}</p>
      </div>
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

function COICard({ coi }: { coi: COIListItem }) {
  const isExpiringSoon =
    coi.expirationDate &&
    new Date(coi.expirationDate) <
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const isExpired =
    coi.expirationDate && new Date(coi.expirationDate) < new Date();

  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">
            {coi.building.name || "Building"}
          </h3>
          <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
            {coi.status}
          </span>
        </div>
        {coi.expirationDate && (
          <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            Expires on{" "}
            <span
              className={`font-medium ${
                isExpired
                  ? "text-red-600"
                  : isExpiringSoon
                  ? "text-amber-600"
                  : "text-neutral-900 dark:text-neutral-100"
              }`}
            >
              {format(new Date(coi.expirationDate), "MMMM dd, yyyy")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="card p-12 text-center">
      <FileText className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">No COIs Yet</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
        You haven&apos;t uploaded any certificates yet. Upload your first COI to
        keep your building compliance up to date.
      </p>
      <button onClick={onUploadClick} className="btn btn-primary">
        <Upload className="h-4 w-4" />
        Upload COI
      </button>
    </div>
  );
}

function UploadCoiModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: () => void;
}) {
  const {
    execute: uploadCoi,
    loading,
  } = useApi("/tenants/upload-coi", {
    showSuccessToast: true,
    successMessage: "COI uploaded successfully",
    showErrorToast: true,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem(
      "file"
    ) as HTMLInputElement | null;
    const policyInput = form.elements.namedItem(
      "policyNumber"
    ) as HTMLInputElement | null;
    const insuranceInput = form.elements.namedItem(
      "insuranceCompany"
    ) as HTMLInputElement | null;
    const effectiveInput = form.elements.namedItem(
      "effectiveDate"
    ) as HTMLInputElement | null;
    const expirationInput = form.elements.namedItem(
      "expirationDate"
    ) as HTMLInputElement | null;

    const file = fileInput?.files?.[0];
    const policyNumber = policyInput?.value;
    const insuranceCompany = insuranceInput?.value;
    const effectiveDate = effectiveInput?.value;
    const expirationDate = expirationInput?.value;
    if (!file || !expirationDate) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("expirationDate", expirationDate);
    if (policyNumber) {
      formData.append("policyNumber", policyNumber);
    }
    if (insuranceCompany) {
      formData.append("insuranceCompany", insuranceCompany);
    }
    if (effectiveDate) {
      formData.append("effectiveDate", effectiveDate);
    }

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
          <h2 className="text-xl font-semibold">Upload COI</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Policy Number
              </label>
              <input name="policyNumber" type="text" className="field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Insurance Company
              </label>
              <input name="insuranceCompany" type="text" className="field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Effective Date
            </label>
            <input name="effectiveDate" type="date" className="field" />
          </div>
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
