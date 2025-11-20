// src/pages/admin/BuildingsManagement.tsx
import { Building as BuildingIcon, Edit2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LoadingOverlay } from "../../../components";
import { useApi } from "../../../hooks/useApi";
import { useSessionQuery } from "../../../state/session";
import { Building, CreateBuildingDto, UpdateBuildingDto } from "../../../types";

export default function BuildingsManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const { data: me } = useSessionQuery({ enabled: true });

  const canManageBuildings =
    me?.role === "ACCOUNT_OWNER" || me?.role === "PORTFOLIO_MANAGER";

  // Fetch buildings - endpoint: GET /buildings
  const {
    data: buildings,
    loading: isLoading,
    execute: fetchBuildings,
  } = useApi<Building[]>("/buildings", {
    showErrorToast: true,
  });

  // Create building - endpoint: POST /buildings
  const {
    loading: isCreatingBuilding,
    execute: createBuilding,
  } = useApi("/buildings", {
    showSuccessToast: true,
    successMessage: "Building created successfully",
    showErrorToast: true,
  });

  // Update building - endpoint: PATCH /buildings/:id
  const {
    loading: isUpdatingBuilding,
    execute: updateBuilding,
  } = useApi("/buildings", {
    showSuccessToast: true,
    successMessage: "Building updated successfully",
    showErrorToast: true,
  });

  // Delete building - endpoint: DELETE /buildings/:id
  const {
    loading: isDeletingBuilding,
    execute: deleteBuilding,
  } = useApi("/buildings", {
    showSuccessToast: true,
    successMessage: "Building deleted successfully",
    showErrorToast: true,
  });

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  const buildingList = buildings ?? [];

  const handleDelete = async (building: Building) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${building.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteBuilding({
          endpoint: `/buildings/${building.id}`,
          method: "DELETE",
        });
        await fetchBuildings();
        console.log("✓ Building deleted successfully");
      } catch (error) {
        console.error("✗ Failed to delete building:", error);
      }
    }
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Buildings Management
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Create and manage buildings in your portfolio
          </p>
        </div>
        {canManageBuildings && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Building
          </button>
        )}
      </div>

      {/* Buildings Grid */}
      {buildingList.length === 0 ? (
        <EmptyState
          onCreateClick={() => setIsCreateModalOpen(true)}
          canManageBuildings={canManageBuildings}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildingList.map((building) => (
            <BuildingCard
              key={building.id}
              building={building}
              onEdit={canManageBuildings ? setEditingBuilding : undefined}
              onDelete={canManageBuildings ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {/* Create Building Modal */}
      {isCreateModalOpen && (
        <BuildingModal
          title="Create New Building"
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={async (data) => {
            try {
              await createBuilding({
                method: "POST",
                body: data,
              });
              await fetchBuildings();
              setIsCreateModalOpen(false);
              console.log("✓ Building created successfully");
            } catch (error) {
              console.error("✗ Failed to create building:", error);
            }
          }}
          isSubmitting={isCreatingBuilding}
        />
      )}

      {/* Edit Building Modal */}
      {editingBuilding && (
        <BuildingModal
          title="Edit Building"
          building={editingBuilding}
          onClose={() => setEditingBuilding(null)}
          onSubmit={async (data) => {
            try {
              await updateBuilding({
                endpoint: `/buildings/${editingBuilding.id}`,
                method: "PATCH",
                body: data,
              });
              await fetchBuildings();
              setEditingBuilding(null);
              console.log("✓ Building updated successfully");
            } catch (error) {
              console.error("✗ Failed to update building:", error);
            }
          }}
          isSubmitting={isUpdatingBuilding || isDeletingBuilding}
        />
      )}
    </div>
  );
}

// Building Card Component
function BuildingCard({
  building,
  onEdit,
  onDelete,
}: {
  building: Building;
  onEdit?: (building: Building) => void;
  onDelete?: (building: Building) => void;
}) {
  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-brand/10 rounded-lg">
          <BuildingIcon className="h-6 w-6 text-brand" />
        </div>
        {onEdit && onDelete && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(building)}
              className="p-2 text-neutral-600 hover:text-brand hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Edit building"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(building)}
              className="p-2 text-neutral-600 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Delete building"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-2">{building.name}</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        {building.address}
      </p>

      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <p className="text-xs text-neutral-500">
          Created {new Date(building.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

// Form data type that works for both create and edit
type BuildingFormData = {
  name: string;
  address: string;
};

// Building Modal Component
function BuildingModal({
  title,
  building,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  title: string;
  building?: Building;
  onClose: () => void;
  onSubmit: (data: CreateBuildingDto | UpdateBuildingDto) => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuildingFormData>({
    defaultValues: building
      ? { name: building.name, address: building.address }
      : { name: "", address: "" },
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
          {/* Building Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Building Name *
            </label>
            <input
              {...register("name", { required: "Building name is required" })}
              type="text"
              className="field"
              placeholder="e.g., Tower Plaza"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-2">Address *</label>
            <textarea
              {...register("address", { required: "Address is required" })}
              className="field"
              rows={3}
              placeholder="e.g., 123 Main St, New York, NY 10001"
            />
            {errors.address && (
              <p className="text-sm text-red-600 mt-1">
                {errors.address.message}
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
              {isSubmitting ? "Saving..." : building ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({
  onCreateClick,
  canManageBuildings,
}: {
  onCreateClick: () => void;
  canManageBuildings: boolean;
}) {
  return (
    <div className="card p-12 text-center">
      <BuildingIcon className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">No Buildings Yet</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
        Start by adding your first building to manage certificates of insurance
        for your properties.
      </p>
      {canManageBuildings && (
        <button onClick={onCreateClick} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Add Your First Building
        </button>
      )}
    </div>
  );
}
