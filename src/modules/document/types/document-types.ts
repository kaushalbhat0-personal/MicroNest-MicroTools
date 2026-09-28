export type Document = {
  id: string;
  firm_id: string;
  notice_id: string;
  uploaded_by: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
};

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
