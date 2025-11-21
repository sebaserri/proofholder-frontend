export interface Building {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuildingWithRequirements extends Building {
  requirements?: RequirementTemplate[];
}

export interface RequirementTemplate {
  id?: string;
  buildingId?: string;
  generalLiabMin?: number;
  autoLiabMin?: number;
  umbrellaMin?: number;
  workersCompRequired: boolean;
  additionalInsuredText?: string;
  certificateHolderText: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBuildingDto {
  name: string;
  address: string;
}

export interface UpdateBuildingDto {
  name?: string;
  address?: string;
}
