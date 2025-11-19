// src/pages/admin/TeamManagement.tsx
import { RefreshCw, Search, Users, UserPlus, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "../../../components";
import { useApi } from "../../../hooks/useApi";
import { useSessionQuery } from "../../../state/session";
import type { UserInvitationItem, UserListItem } from "../../../types";

interface InviteUserPayload {
  email: string;
  firstName?: string;
  lastName?: string;
}

type InviteRole =
  | "PORTFOLIO_MANAGER"
  | "PROPERTY_MANAGER"
  | "BUILDING_OWNER"
  | "GUARD";

export default function TeamManagementPage() {
  const { data: me } = useSessionQuery({ enabled: true });
  const [inviteRole, setInviteRole] = useState<InviteRole | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const {
    data: users,
    loading: loadingUsers,
    error: usersError,
    execute: fetchUsers,
  } = useApi<UserListItem[]>("/users", {
    showErrorToast: true,
  });

  const {
    data: invitations,
    loading: loadingInvitations,
    execute: fetchInvitations,
  } = useApi<UserInvitationItem[]>("/users/invitations", {
    showErrorToast: true,
  });

  const {
    execute: mutateInvitation,
  } = useApi("/users/invitations", {
    showSuccessToast: true,
    successMessage: "Invitation updated",
    showErrorToast: true,
  });

  useEffect(() => {
    if (me) {
      fetchUsers();
      fetchInvitations();
    }
  }, [me, fetchUsers, fetchInvitations]);

  const canInvitePortfolioManager = me?.role === "ACCOUNT_OWNER";
  const canInvitePropertyManager =
    me?.role === "ACCOUNT_OWNER" || me?.role === "PORTFOLIO_MANAGER";
  const canInviteGuard =
    me?.role === "ACCOUNT_OWNER" ||
    me?.role === "PORTFOLIO_MANAGER" ||
    me?.role === "PROPERTY_MANAGER";

  const userList = users ?? [];
  const filteredUsers = userList.filter((u) => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const term = search.trim().toLowerCase();
    if (!term) return matchesRole;
    const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
    const haystack = `${fullName} ${u.email}`.toLowerCase();
    return matchesRole && haystack.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Invite managers, guards and tenants to your organization.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {canInvitePortfolioManager && (
          <ActionCard
            title="Portfolio Managers"
            description="High-level managers across your portfolio."
            onClick={() => setInviteRole("PORTFOLIO_MANAGER")}
          />
        )}
        {canInvitePropertyManager && (
          <ActionCard
            title="Property Managers"
            description="Managers responsible for day-to-day building operations."
            onClick={() => setInviteRole("PROPERTY_MANAGER")}
          />
        )}
        {canInviteGuard && (
          <ActionCard
            title="Guards"
            description="Front-desk and security guards for access checks."
            onClick={() => setInviteRole("GUARD")}
          />
        )}
        {me?.role &&
          (me.role === "ACCOUNT_OWNER" || me.role === "PORTFOLIO_MANAGER") && (
            <ActionCard
              title="Building Owners"
              description="External building owners for reporting and read-only access."
              onClick={() => setInviteRole("BUILDING_OWNER")}
            />
          )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="field h-9"
          >
            <option value="ALL">All</option>
            <option value="ACCOUNT_OWNER">Account Owner</option>
            <option value="PORTFOLIO_MANAGER">Portfolio Manager</option>
            <option value="PROPERTY_MANAGER">Property Manager</option>
            <option value="BUILDING_OWNER">Building Owner</option>
            <option value="GUARD">Guard</option>
            <option value="TENANT">Tenant</option>
            <option value="VENDOR">Vendor</option>
          </select>
        </div>
        <div className="flex-1">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field pl-8 h-9 w-full"
              placeholder="Search by name or email…"
            />
          </div>
        </div>
      </div>

      {/* Pending invitations */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-semibold">Pending invitations</h2>
        </div>
        {loadingInvitations && (
          <p className="text-sm text-neutral-500">Loading invitations…</p>
        )}
        {!loadingInvitations && (invitations?.length ?? 0) === 0 && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            No pending invitations without a registered user.
          </p>
        )}
        {!loadingInvitations && invitations && invitations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">
                    Invited By
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">
                    Expires
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-neutral-500 text-xs uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {invitations.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                  >
                    <td className="px-4 py-2">{inv.email}</td>
                    <td className="px-4 py-2 text-xs font-mono">{inv.role}</td>
                    <td className="px-4 py-2 text-xs text-neutral-500">
                      {inv.invitedByName ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-xs text-neutral-500">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right text-xs">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs mr-2 inline-flex items-center gap-1"
                        onClick={async () => {
                          try {
                            await mutateInvitation({
                              endpoint: `/users/invitations/${inv.id}/resend`,
                              method: "POST",
                            });
                          } catch {
                            // toast handled
                          }
                        }}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Resend
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-red-600 inline-flex items-center gap-1"
                        onClick={async () => {
                          try {
                            await mutateInvitation({
                              endpoint: `/users/invitations/${inv.id}/revoke`,
                              method: "POST",
                            });
                            fetchInvitations();
                          } catch {
                            // toast handled
                          }
                        }}
                      >
                        <XCircle className="h-3 w-3" />
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Team list */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-semibold">Team overview</h2>
        </div>
        {loadingUsers && (
          <p className="text-sm text-neutral-500">Loading team…</p>
        )}
        {usersError && (
          <p className="text-sm text-red-600">
            {(usersError as Error).message || "Failed to load team"}
          </p>
        )}
        {!loadingUsers && filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">
                    Created
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">
                    Last Access
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredUsers.map((u) => {
                  const fullName =
                    (u.firstName || u.lastName
                      ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                      : "") || null;
                  return (
                    <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                      <td className="px-4 py-2">
                        <div className="font-medium">
                          {fullName ?? u.email}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-neutral-600 dark:text-neutral-300">
                        {u.email}
                      </td>
                      <td className="px-4 py-2 text-xs font-mono">
                        {u.role}
                      </td>
                      <td className="px-4 py-2 text-xs text-neutral-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-xs text-neutral-500">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {u.invited ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                            Invited
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          !loadingUsers && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              No team members found yet. Use the cards above to invite new
              managers, guards or tenants.
            </p>
          )
        )}
      </Card>

      {/* Invite modal */}
      {inviteRole && (
        <InviteUserModal role={inviteRole} onClose={() => setInviteRole(null)} />
      )}
    </div>
  );
}

function ActionCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card p-4 text-left hover:shadow-md transition-shadow group"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="inline-flex items-center gap-1 text-xs text-brand">
          <UserPlus className="h-3.5 w-3.5" />
          Invite
        </span>
      </div>
      <p className="text-xs text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
    </button>
  );
}

function InviteUserModal({
  role,
  onClose,
}: {
  role: InviteRole;
  onClose: () => void;
}) {
  const roleLabelMap: Record<InviteRole, string> = {
    PORTFOLIO_MANAGER: "Portfolio Manager",
    PROPERTY_MANAGER: "Property Manager",
    BUILDING_OWNER: "Building Owner",
    GUARD: "Guard",
  };

  const label = roleLabelMap[role];

  const { execute, loading, error } = useApi("/users/invite", {
    showSuccessToast: true,
    successMessage: `Invitation sent to ${label}`,
    showErrorToast: true,
  });

  const [form, setForm] = useState<InviteUserPayload>({ email: "" });

  const handleChange = (field: keyof InviteUserPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) return;

    try {
      await execute({
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          firstName: form.firstName || undefined,
          lastName: form.lastName || undefined,
          role,
        }),
      });
      onClose();
    } catch {
      // handled by useApi toast
    }
  };

  const emailError = !form.email
    ? "Email is required"
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ? "Invalid email address"
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold">Invite {label}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              className="field"
              placeholder="manager@example.com"
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-600">{emailError}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First name
              </label>
              <input
                type="text"
                value={form.firstName || ""}
                onChange={handleChange("firstName")}
                className="field"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Last name
              </label>
              <input
                type="text"
                value={form.lastName || ""}
                onChange={handleChange("lastName")}
                className="field"
                placeholder="Doe"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600">
              {(error as Error).message ?? "Failed to send invitation"}
            </p>
          )}

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
              disabled={loading || !!emailError}
            >
              {loading ? "Sending…" : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
