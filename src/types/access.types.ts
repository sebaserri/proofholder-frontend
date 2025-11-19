// src/types/access.types.ts
export interface AccessCheckResult {
  isApproved: boolean;
  reason: string;
  coiId?: string | null;
  status?: string;
  effectiveDate?: string;
  expirationDate?: string;
  vendorId?: string;
  buildingId?: string;
}

export interface AccessCheckParams {
  vendorId: string;
  buildingId: string;
}
