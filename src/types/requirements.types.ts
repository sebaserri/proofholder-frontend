export interface Requirement {
  id: string;
  buildingId: string;
  // Simplificado para adaptarse al RequirementTemplate del backend;
  // propiedades específicas se manejan en los componentes que consumen este tipo.
  [key: string]: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequirementDto {
  [key: string]: any;
}

export interface UpdateRequirementDto {
  [key: string]: any;
}
