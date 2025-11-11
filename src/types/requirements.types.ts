export interface Requirement {
  id: string;
  buildingId: string;
  type: string;
  description: string;
  minimumAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequirementDto {
  type: string;
  description: string;
  minimumAmount?: number;
}

export interface UpdateRequirementDto {
  type?: string;
  description?: string;
  minimumAmount?: number;
}
