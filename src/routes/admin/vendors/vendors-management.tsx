// src/pages/admin/VendorsManagement.tsx
import { Link } from "@tanstack/react-router";
import { Mail, Phone, Plus, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LoadingOverlay } from "../../../components";
import { useApi } from "../../../hooks/useApi";
import {
  BulkApproveVendorsDto,
  CreateVendorDto,
  InviteVendorDto,
  VendorListItem,
} from "../../../types";

export default function VendorsManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isBulkApproveModalOpen, setIsBulkApproveModalOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);

  // Fetch vendors - endpoint: GET /vendors
  const {
    data: vendors,
    loading: isLoading,
    execute: fetchVendors,
  } = useApi<VendorListItem[]>("/vendors", {
    showErrorToast: true,
  });

  // Create vendor - endpoint: POST /vendors
  const {
    loading: isCreatingVendor,
    execute: createVendor,
  } = useApi("/vendors", {
    showSuccessToast: true,
    successMessage: "Vendor created successfully",
    showErrorToast: true,
  });

  // Update phone - endpoint: POST /vendors/:id/phone
  const {
    loading: isUpdatingPhone,
    execute: updateVendorPhone,
  } = useApi("/vendors", {
    showSuccessToast: true,
    successMessage: "Vendor phone updated successfully",
    showErrorToast: true,
  });

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const vendorList = vendors ?? [];
  const editingVendor =
    vendorList.find((v) => v.id === editingVendorId) ?? null;

  if (isLoading) return <LoadingOverlay />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Vendors Management
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Manage vendor companies, authorizations and contact information
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="btn btn-ghost"
          >
            <Plus className="h-4 w-4" />
            Invite Vendor
          </button>
          <button
            onClick={() => setIsBulkApproveModalOpen(true)}
            className="btn btn-ghost"
          >
            Bulk Approve
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Vendors List */}
      {vendorList.length === 0 ? (
        <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {vendorList.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  <td className="px-6 py-4">
                    <Link
                      to="/admin/vendors/$id"
                      params={{ id: vendor.id }}
                      className="font-medium text-brand hover:underline"
                    >
                      {vendor.companyName}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Mail className="h-3.5 w-3.5" />
                        {vendor.contactEmail}
                      </div>
                      {vendor.contactPhone && (
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                          <Phone className="h-3.5 w-3.5" />
                          {vendor.contactPhone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                      <div>
                        Buildings:{" "}
                        <span className="font-medium">
                          {vendor.authorizedBuildings}
                        </span>
                      </div>
                      <div>
                        Active COIs:{" "}
                        <span className="font-medium">
                          {vendor.activeCOIs}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setEditingVendorId(vendor.id)}
                      className="text-sm text-brand hover:underline"
                    >
                      Edit Phone
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Vendor Modal */}
      {isCreateModalOpen && (
        <VendorModal
          title="Create New Vendor"
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={async (data) => {
            try {
              await createVendor({
                method: "POST",
                body: JSON.stringify(data),
              });
              await fetchVendors();
              setIsCreateModalOpen(false);
              console.log("✓ Vendor created successfully");
            } catch (error) {
              console.error("✗ Failed to create vendor:", error);
            }
          }}
          isSubmitting={isCreatingVendor}
        />
      )}

      {/* Edit Phone Modal */}
      {editingVendor && (
        <PhoneModal
          vendor={editingVendor}
          onClose={() => setEditingVendorId(null)}
          onSubmit={async (contactPhone) => {
            try {
              await updateVendorPhone({
                endpoint: `/vendors/${editingVendor.id}/phone`,
                method: "POST",
                body: JSON.stringify({ contactPhone }),
              });
              await fetchVendors();
              setEditingVendorId(null);
              console.log("✓ Vendor phone updated successfully");
            } catch (error) {
              console.error("✗ Failed to update vendor phone:", error);
            }
          }}
          isSubmitting={isUpdatingPhone}
        />
      )}

      {/* Invite Vendor Modal */}
      {isInviteModalOpen && (
        <InviteVendorModal
          onClose={() => setIsInviteModalOpen(false)}
          onSuccess={() => {
            setIsInviteModalOpen(false);
            fetchVendors();
          }}
        />
      )}

      {/* Bulk Approve Modal */}
      {isBulkApproveModalOpen && (
        <BulkApproveModal
          vendors={vendorList}
          onClose={() => setIsBulkApproveModalOpen(false)}
          onSuccess={() => {
            setIsBulkApproveModalOpen(false);
            fetchVendors();
          }}
        />
      )}
    </div>
  );
}

// Form data type
type VendorFormData = {
  legalName: string;
  contactEmail: string;
};

// Vendor Modal Component (Create only)
function VendorModal({
  title,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (data: CreateVendorDto) => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormData>({
    defaultValues: { legalName: "", contactEmail: "" },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Legal Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Legal Name *
            </label>
            <input
              {...register("legalName", { required: "Legal name is required" })}
              type="text"
              className="field"
              placeholder="e.g., ACME Plumbing LLC"
            />
            {errors.legalName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.legalName.message}
              </p>
            )}
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Contact Email *
            </label>
            <input
              {...register("contactEmail", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              className="field"
              placeholder="e.g., contact@acme.com"
            />
            {errors.contactEmail && (
              <p className="text-sm text-red-600 mt-1">
                {errors.contactEmail.message}
              </p>
            )}
          </div>

          {/* Actions */}
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
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Invite Vendor Modal
function InviteVendorModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const {
    loading,
    execute: inviteVendor,
  } = useApi<void>("/vendors/invite", {
    showSuccessToast: true,
    successMessage: "Vendor invitation sent",
    showErrorToast: true,
  });

  const { register, handleSubmit, reset } = useForm<InviteVendorDto>({
    defaultValues: {
      email: "",
      companyName: "",
      contactName: "",
      invitationMessage: "",
    },
  });

  const onSubmit = async (data: InviteVendorDto) => {
    try {
      await inviteVendor({
        method: "POST",
        body: JSON.stringify(data),
      });
      reset();
      onSuccess();
    } catch {
      // Error handled by useApi
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold">Invite Vendor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              {...register("email", { required: "Email is required" })}
              type="email"
              className="field"
              placeholder="vendor@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Company Name *
            </label>
            <input
              {...register("companyName", {
                required: "Company name is required",
              })}
              type="text"
              className="field"
              placeholder="ACME Services LLC"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Contact Name
            </label>
            <input
              {...register("contactName")}
              type="text"
              className="field"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Invitation Message
            </label>
            <textarea
              {...register("invitationMessage")}
              className="field"
              rows={3}
              placeholder="Optional message to include in the invitation"
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
              {loading ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Bulk Approve Modal
function BulkApproveModal({
  vendors,
  onClose,
  onSuccess,
}: {
  vendors: VendorListItem[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const {
    loading,
    execute: bulkApprove,
  } = useApi("/vendors/bulk/approve", {
    showSuccessToast: true,
    successMessage: "Vendors approved",
    showErrorToast: true,
  });

  const { data: buildings, execute: fetchBuildings } = useApi<
    { id: string; name: string }[]
  >("/buildings", { showErrorToast: true });

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  const { register, handleSubmit, watch } = useForm<BulkApproveVendorsDto>({
    defaultValues: { vendorIds: [], buildingId: "" },
  });

  const selectedVendorIds = watch("vendorIds") || [];

  const onSubmit = async (data: BulkApproveVendorsDto) => {
    try {
      await bulkApprove({
        method: "POST",
        body: JSON.stringify(data),
      });
      onSuccess();
    } catch {
      // handled by useApi
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold">Bulk Approve Vendors</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Building *
            </label>
            <select
              {...register("buildingId", { required: true })}
              className="field"
            >
              <option value="">Select building…</option>
              {(buildings ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Vendors to approve *
            </label>
            <div className="max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded-lg">
              {vendors.map((v) => {
                const checked = selectedVendorIds.includes(v.id);
                return (
                  <label
                    key={v.id}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{v.companyName}</div>
                      <div className="text-xs text-neutral-500">
                        {v.contactEmail}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      value={v.id}
                      {...register("vendorIds")}
                      defaultChecked={checked}
                    />
                  </label>
                );
              })}
            </div>
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
              disabled={loading || !selectedVendorIds.length}
            >
              {loading ? "Approving..." : "Approve Selected"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Phone Modal Component (Edit phone only)
function PhoneModal({
  vendor,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  vendor: VendorListItem;
  onClose: () => void;
  onSubmit: (contactPhone: string) => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ contactPhone: string }>({
    defaultValues: { contactPhone: vendor.contactPhone || "" },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold">Edit Phone</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit((data) => onSubmit(data.contactPhone))}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              Vendor:{" "}
              <span className="font-normal">{vendor.companyName}</span>
            </label>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Contact Phone *
            </label>
            <input
              {...register("contactPhone", {
                required: "Phone is required",
              })}
              type="tel"
              className="field"
              placeholder="e.g., +1 (555) 123-4567"
            />
            {errors.contactPhone && (
              <p className="text-sm text-red-600 mt-1">
                {errors.contactPhone.message}
              </p>
            )}
          </div>

          {/* Actions */}
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
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="card p-12 text-center">
      <Users className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">No Vendors Yet</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
        Start by adding your first vendor company to track their certificates of
        insurance.
      </p>
      <button onClick={onCreateClick} className="btn btn-primary">
        <Plus className="h-4 w-4" />
        Add Your First Vendor
      </button>
    </div>
  );
}
