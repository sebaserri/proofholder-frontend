// src/types/vendor.types.ts

// Basic vendor info (used across app)
export interface Vendor {
  id: string;
  legalName: string;
  contactEmail: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorDto {
  legalName: string;
  contactEmail: string;
  contactPhone?: string;
}

export interface UpdateVendorDto {
  legalName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// Management vendor list item (matches VendorListDto in backend)
export interface VendorListItem {
  id: string;
  companyName: string;
  contactName: string;
  contactPhone?: string;
  contactEmail: string;
  serviceType?: string[];
  authorizedBuildings: number;
  activeCOIs: number;
  lastLoginAt?: string;
}

// Vendor authorization (matches VendorAuthorizationDto)
export interface VendorAuthorization {
  id: string;
  vendorId: string;
  buildingId: string;
  buildingName: string;
  buildingAddress: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  notes?: string;
  createdAt: string;
}

// Vendor statistics (matches VendorStatsDto)
export interface VendorStats {
  vendorId: string;
  vendorName: string;
  totalBuildings: number;
  approvedBuildings: number;
  totalCOIs: number;
  activeCOIs: number;
  expiredCOIs: number;
  pendingCOIs: number;
  complianceRate: number;
  lastCOIUploadDate?: string;
  nextCOIExpirationDate?: string;
  serviceTypes?: string[];
}

// Invite vendor payload
export interface InviteVendorDto {
  email: string;
  companyName: string;
  contactName?: string;
  buildingIds?: string[];
  invitationMessage?: string;
}

// Bulk approve vendors payload
export interface BulkApproveVendorsDto {
  vendorIds: string[];
  buildingId: string;
  notes?: string;
}

// Approve / reject vendor for building
export interface ApproveVendorDto {
  buildingId: string;
  notes?: string;
}

export interface RejectVendorDto {
  buildingId: string;
  notes?: string;
}

// Notify vendor payload (matches NotifyVendorDto)
export type NotificationType =
  | "COI_EXPIRING"
  | "COI_EXPIRED"
  | "APPROVAL"
  | "REJECTION"
  | "CUSTOM";

export interface NotifyVendorDto {
  vendorId: string;
  notificationType: NotificationType;
  customMessage?: string;
  sendSMS?: boolean;
}
