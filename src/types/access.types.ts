// src/types/access.types.ts
export interface AccessCheckResult {
  status: "APTO" | "NO_APTO";
  reasons?: string[];
  coi?: {
    id: string;
    expirationDate: string;
    status: string;
  };
}

export interface AccessCheckParams {
  vendorId: string;
  buildingId: string;
}
