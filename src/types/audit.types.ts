export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "LOGIN"
  | "LOGOUT"
  | "UPLOAD"
  | "DOWNLOAD"
  | "VIEW";

export type EntityType =
  | "COI"
  | "BUILDING"
  | "VENDOR"
  | "REQUIREMENT"
  | "USER"
  | "SETTING";

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  userId: string;
  userName: string;
  userRole: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

// Backend response structure
export interface AuditListResponse {
  items: AuditLogItem[];
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}

// Backend audit log structure
export interface AuditLogItem {
  id: string;
  entity: string; // e.g., "COI", "BUILDING", "VENDOR"
  entityId: string;
  action: string; // e.g., "REVIEW.APPROVED", "CREATE"
  actorId: string;
  details?: any;
  at: string; // ISO timestamp
}
