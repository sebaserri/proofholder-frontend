// src/pages/admin/TenantsManagement.tsx
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Phone, Plus, Users, X } from "lucide-react";
import { LoadingOverlay } from "../../../components";
import { useApi } from "../../../hooks/useApi";
import { useSessionQuery } from "../../../state/session";
import { Building, TenantListItem, CreateTenantDto } from "../../../types";

export default function TenantsManagementPage() {
  const { data: me } = useSessionQuery({ enabled: true });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [buildingFilter, setBuildingFilter] = useState<string>("");
  const [coiFilter, setCoiFilter] = useState<"ALL" | "VALID" | "EXPIRED" | "MISSING">("ALL");
  const [leaseFrom, setLeaseFrom] = useState<string>("");
  const [leaseTo, setLeaseTo] = useState<string>("");

  const canManageTenants =
    me?.role === "ACCOUNT_OWNER" ||
    me?.role === "PORTFOLIO_MANAGER" ||
    me?.role === "PROPERTY_MANAGER";

  // Buildings accessible to user
  const {
    data: buildings,
    execute: fetchBuildings,
  } = useApi<Building[]>("/buildings", {
    showErrorToast: true,
  });

  // Tenants list
  const {
    data: tenants,
    loading: loadingTenants,
    execute: fetchTenants,
  } = useApi<TenantListItem[]>(
    buildingFilter ? `/tenants?buildingId=${buildingFilter}` : "/tenants",
    {
      showErrorToast: true,
    }
  );

  // Create tenant
  const {
    execute: createTenant,
    loading: creatingTenant,
  } = useApi("/tenants", {
    showSuccessToast: true,
    successMessage: "Tenant created successfully",
    showErrorToast: true,
  });

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants, buildingFilter]);

  if (loadingTenants) return <LoadingOverlay />;

  const buildingList = buildings ?? [];
  const tenantList = tenants ?? [];

  const filteredTenants = tenantList.filter((tenant) => {
    // COI status filter
    const statusFilter =
      coiFilter === "ALL"
        ? true
        : coiFilter === "VALID"
        ? !!tenant.hasValidCOI
        : coiFilter === "EXPIRED"
        ? !tenant.hasValidCOI && !!tenant.coiExpirationDate
        : // MISSING
          !tenant.hasValidCOI && !tenant.coiExpirationDate;

    if (!statusFilter) return false;

    // Lease date filter (client-side)
    if (leaseFrom) {
      const from = new Date(leaseFrom);
      const start =
        tenant.leaseStartDate ? new Date(tenant.leaseStartDate) : null;
      if (!start || start < from) return false;
    }
    if (leaseTo) {
      const to = new Date(leaseTo);
      const end = tenant.leaseEndDate
        ? new Date(tenant.leaseEndDate)
        : null;
      if (!end || end > to) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Manage tenants across your buildings.
          </p>
        </div>
        {canManageTenants && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Tenant
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Building</label>
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="field w-full"
          >
            <option value="">All Buildings</option>
            {buildingList.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">COI Status</label>
          <select
            value={coiFilter}
            onChange={(e) =>
              setCoiFilter(e.target.value as typeof coiFilter)
            }
            className="field w-full"
          >
            <option value="ALL">All</option>
            <option value="VALID">Valid</option>
            <option value="EXPIRED">Expired</option>
            <option value="MISSING">Missing</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Lease Start From
          </label>
          <input
            type="date"
            value={leaseFrom}
            onChange={(e) => setLeaseFrom(e.target.value)}
            className="field w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Lease End To</label>
          <input
            type="date"
            value={leaseTo}
            onChange={(e) => setLeaseTo(e.target.value)}
            className="field w-full"
          />
        </div>
      </div>

      {/* Tenant List */}
      {filteredTenants.length === 0 ? (
        <EmptyState
          canManageTenants={canManageTenants}
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  COI Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredTenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  <td className="px-6 py-4">
                    <Link
                      to="/admin/tenants/$id"
                      params={{ id: tenant.id }}
                      className="font-medium text-brand hover:underline"
                    >
                      {tenant.businessName}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Users className="h-3.5 w-3.5" />
                        {tenant.contactName}
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Mail className="h-3.5 w-3.5" />
                        {tenant.contactEmail}
                      </div>
                      {tenant.contactPhone && (
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                          <Phone className="h-3.5 w-3.5" />
                          {tenant.contactPhone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                    {tenant.unitNumber}
                  </td>
                  <td className="px-6 py-4 text-right text-xs">
                    {tenant.hasValidCOI ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                        Valid
                      </span>
                    ) : tenant.coiExpirationDate ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                        Missing
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Tenant Modal */}
      {isCreateModalOpen && canManageTenants && (
        <CreateTenantModal
          buildings={buildingList}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={async (data) => {
            try {
              await createTenant({
                method: "POST",
                body: JSON.stringify(data),
              });
              await fetchTenants();
              setIsCreateModalOpen(false);
            } catch {
              // handled by useApi
            }
          }}
          isSubmitting={creatingTenant}
        />
      )}
    </div>
  );
}

type TenantFormData = {
  buildingId: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  unitNumber: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
};

function CreateTenantModal({
  buildings,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  buildings: Building[];
  onClose: () => void;
  onSubmit: (data: CreateTenantDto) => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormData>({
    defaultValues: {
      buildingId: "",
      businessName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      unitNumber: "",
    },
  });

  const handleFormSubmit = (data: TenantFormData) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold">Create Tenant</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Building *
            </label>
            <select
              {...register("buildingId", { required: "Building is required" })}
              className="field"
            >
              <option value="">Select building…</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.buildingId && (
              <p className="text-sm text-red-600 mt-1">
                {errors.buildingId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Business Name *
            </label>
            <input
              {...register("businessName", {
                required: "Business name is required",
              })}
              type="text"
              className="field"
              placeholder="Tenant business name"
            />
            {errors.businessName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.businessName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Contact Name *
            </label>
            <input
              {...register("contactName", {
                required: "Contact name is required",
              })}
              type="text"
              className="field"
              placeholder="John Doe"
            />
            {errors.contactName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.contactName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Contact Email *
            </label>
            <input
              {...register("contactEmail", {
                required: "Contact email is required",
              })}
              type="email"
              className="field"
              placeholder="tenant@example.com"
            />
            {errors.contactEmail && (
              <p className="text-sm text-red-600 mt-1">
                {errors.contactEmail.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Contact Phone
            </label>
            <input
              {...register("contactPhone")}
              type="tel"
              className="field"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Unit Number *
            </label>
            <input
              {...register("unitNumber", {
                required: "Unit number is required",
              })}
              type="text"
              className="field"
              placeholder="Suite 1203"
            />
            {errors.unitNumber && (
              <p className="text-sm text-red-600 mt-1">
                {errors.unitNumber.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Lease Start
              </label>
              <input
                {...register("leaseStartDate")}
                type="date"
                className="field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Lease End
              </label>
              <input
                {...register("leaseEndDate")}
                type="date"
                className="field"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyState({
  canManageTenants,
  onCreateClick,
}: {
  canManageTenants: boolean;
  onCreateClick: () => void;
}) {
  return (
    <div className="card p-12 text-center">
      <Users className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">No Tenants Yet</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
        Tenants will appear here once they are created for your buildings.
      </p>
      {canManageTenants && (
        <button onClick={onCreateClick} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Add Your First Tenant
        </button>
      )}
    </div>
  );
}
