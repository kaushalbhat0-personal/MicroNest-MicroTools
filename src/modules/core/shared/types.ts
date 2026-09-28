export type UUID = string;

// Future NoticeFlow enums (e.g., firm roles) belong in their domain modules (Phase 1+).
// No RBAC types or behavior exists in Phase 0.

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: { total: number; page: number; limit: number; totalPages: number };
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
