// src/types/coi.types.ts
export type COIStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface COI {
  id: string;
  vendorId: string;
  buildingId: string;
  tenantId?: string | null;
  vendor: {
    id: string;
    legalName: string;
    contactEmail: string;
  };
  building: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  insuranceCompany?: string;
  producer?: string;
  insuredName?: string;
  policyNumber?: string;
  insurer?: string;
  holder?: string;
  coverageType?: string[] | null;
  coverageAmounts?: unknown;
  glOccurrence?: number | null;
  glAggregate?: number | null;
  glProductsOps?: number | null;
  glPersonalAdv?: number | null;
  glMedicalExp?: number | null;
  glDamageRented?: number | null;
  autoBodyInjury?: number | null;
  autoPropDamage?: number | null;
  autoCombined?: number | null;
  umbrellaLimit?: number | null;
  umbrellaRetention?: number | null;
  wcPerAccident?: number | null;
  wcPerEmployee?: number | null;
  wcPolicyLimit?: number | null;
  generalLiabLimit?: number;
  autoLiabLimit?: number;
  umbrellaLimitLegacy?: number;
  workersComp?: boolean;
  additionalInsured?: boolean;
  waiverSubrogation?: boolean;
  waiverOfSubrogation?: boolean;
  primaryNonContrib?: boolean;
  noticeOfCancel?: number | null;
  certificateHolder?: string;
  effectiveDate?: string;
  expirationDate?: string;
  status: COIStatus;
  notes?: string;
  files: COIFile[];
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  uploadedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface COIFile {
  id: string;
  url: string;
  kind: string;
  coiId?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt?: string;
}

export interface COIListItem {
  id: string;
  vendorId: string;
  buildingId: string;
  vendor: { id: string; legalName: string };
  building: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  tenantId?: string | null;
  insuranceCompany?: string;
  producer?: string;
  insuredName?: string;
  policyNumber?: string;
  insurer?: string;
  holder?: string;
  coverageType?: string[] | null;
  coverageAmounts?: unknown;
  glOccurrence?: number | null;
  glAggregate?: number | null;
  glProductsOps?: number | null;
  glPersonalAdv?: number | null;
  glMedicalExp?: number | null;
  glDamageRented?: number | null;
  autoBodyInjury?: number | null;
  autoPropDamage?: number | null;
  autoCombined?: number | null;
  umbrellaLimit?: number | null;
  umbrellaRetention?: number | null;
  wcPerAccident?: number | null;
  wcPerEmployee?: number | null;
  wcPolicyLimit?: number | null;
  additionalInsured?: boolean;
  waiverSubrogation?: boolean;
  primaryNonContrib?: boolean;
  noticeOfCancel?: number | null;
  effectiveDate?: string;
  expirationDate?: string;
  status: COIStatus;
  generalLiabLimit?: number;
  autoLiabLimit?: number;
  workersComp?: boolean;
  createdAt: string;
  uploadedAt?: string;
  files?: COIFile[];
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  uploadedBy?: string | null;
}

export interface COIReviewPayload {
  status: COIStatus;
  notes?: string;
}
