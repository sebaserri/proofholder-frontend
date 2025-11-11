// src/routes/coi/admin-list.tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  XCircle,
} from "lucide-react";
import { fetchApi } from "../../lib/api";
import type { COIListItem } from "../../types/coi.types";

export default function AdminCoiListPage() {
  // Fetch COIs
  const {
    data: cois,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cois"],
    queryFn: () => fetchApi("/cois"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading COIs</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          {(error as Error).message || "Failed to load certificates"}
        </p>
      </div>
    );
  }

  const coiList = (cois as any)?.data || (cois as COIListItem[]) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certificates of Insurance</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage and review vendor insurance certificates
          </p>
        </div>
        <Link to="/admin/request" className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Request COI
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="search"
                placeholder="Search vendors..."
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
            <select className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-brand focus:border-transparent">
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* COI List */}
      {coiList.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No COIs Found</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Get started by requesting a COI from a vendor.
            </p>
            <Link to="/admin/request" className="btn btn-primary">
              <Plus className="h-4 w-4" />
              Request First COI
            </Link>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Building
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Insured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Coverage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Expiration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-950 divide-y divide-neutral-200 dark:divide-neutral-800">
                {coiList.map((coi: COIListItem) => (
                  <COIRow key={coi.id} coi={coi} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Pending Review"
          value={
            coiList.filter((c: COIListItem) => c.status === "PENDING").length
          }
          color="yellow"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Approved"
          value={
            coiList.filter((c: COIListItem) => c.status === "APPROVED").length
          }
          color="green"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="Rejected"
          value={
            coiList.filter((c: COIListItem) => c.status === "REJECTED").length
          }
          color="red"
        />
      </div>
    </div>
  );
}

// Helper Components
function COIRow({ coi }: { coi: COIListItem }) {
  const isExpired = coi.expirationDate
    ? new Date(coi.expirationDate) < new Date()
    : false;
  const daysUntilExpiry = coi.expirationDate
    ? Math.ceil(
        (new Date(coi.expirationDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;
  const isExpiringSoon =
    daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 30;

  return (
    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
      {/* Vendor */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Building2 className="h-4 w-4 text-neutral-400 mr-2" />
          <div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {coi.vendor.legalName}
            </div>
            <div className="text-xs text-neutral-500">
              ID: {coi.vendorId.slice(0, 8)}...
            </div>
          </div>
        </div>
      </td>

      {/* Building */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-neutral-900 dark:text-neutral-100">
          {coi.building.name}
        </div>
      </td>

      {/* Insured */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-neutral-900 dark:text-neutral-100">
          {coi.insuredName || "—"}
        </div>
      </td>

      {/* Coverage */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm space-y-1">
          {coi.generalLiabLimit && (
            <div className="flex items-center gap-1">
              <span className="text-neutral-500">GL:</span>
              <span className="font-medium">
                ${(coi.generalLiabLimit / 1000000).toFixed(1)}M
              </span>
            </div>
          )}
          {coi.autoLiabLimit && (
            <div className="flex items-center gap-1">
              <span className="text-neutral-500">Auto:</span>
              <span className="font-medium">
                ${(coi.autoLiabLimit / 1000000).toFixed(1)}M
              </span>
            </div>
          )}
          {coi.workersComp && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs text-neutral-600">WC</span>
            </div>
          )}
        </div>
      </td>

      {/* Expiration */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-neutral-400" />
          <div>
            {coi.expirationDate ? (
              <>
                <div
                  className={`text-sm font-medium ${
                    isExpired
                      ? "text-red-600"
                      : isExpiringSoon
                      ? "text-amber-600"
                      : "text-neutral-900 dark:text-neutral-100"
                  }`}
                >
                  {new Date(coi.expirationDate).toLocaleDateString()}
                </div>
                {isExpired ? (
                  <div className="text-xs text-red-500">Expired</div>
                ) : isExpiringSoon ? (
                  <div className="text-xs text-amber-500">
                    {daysUntilExpiry} days left
                  </div>
                ) : null}
              </>
            ) : (
              <span className="text-sm text-neutral-500">—</span>
            )}
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={coi.status} />
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <Link
          to="/admin/cois/$id"
          params={{ id: coi.id }}
          className="text-brand hover:text-brand-dark font-medium inline-flex items-center gap-1 hover:underline"
        >
          View Details
          <FileText className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-800 dark:text-yellow-300",
      icon: Clock,
    },
    APPROVED: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-800 dark:text-green-300",
      icon: CheckCircle,
    },
    REJECTED: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-800 dark:text-red-300",
      icon: XCircle,
    },
  };

  const style = styles[status as keyof typeof styles] || styles.PENDING;
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "yellow" | "green" | "red";
}) {
  const colors = {
    yellow:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300",
    green:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
  };

  return (
    <div className={`border rounded-lg p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="opacity-60">{icon}</div>
      </div>
    </div>
  );
}
