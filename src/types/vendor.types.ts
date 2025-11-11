// src/types/vendor.types.ts
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
