// src/types/tenant.types.ts

export interface TenantListItem {
  id: string;
  businessName: string;
  contactName: string;
  contactPhone?: string | null;
  contactEmail: string;
  unitNumber: string;
  leaseStartDate?: string | null;
  leaseEndDate?: string | null;
  hasValidCOI?: boolean;
  coiExpirationDate?: string | null;
}

export interface TenantDetail {
  id: string;
  userId: string;
  buildingId: string;
  businessName: string;
  contactName: string;
  contactPhone?: string | null;
  contactEmail: string;
  unitNumber: string;
  leaseStartDate?: string | null;
  leaseEndDate?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantStats {
  tenantId: string;
  totalCOIs: number;
  activeCOIs: number;
  expiredCOIs: number;
  pendingCOIs: number;
}

export interface CreateTenantDto {
  buildingId: string;
  businessName: string;
  contactName: string;
  contactPhone?: string;
  contactEmail: string;
  unitNumber: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
}

export interface UpdateTenantDto {
  businessName?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  unitNumber?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
}

