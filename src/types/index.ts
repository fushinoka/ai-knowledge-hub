export type DocumentRole = "owner" | "editor" | "viewer";

export interface KnowledgeDocument {
  id: string;
  owner_id: string;
  title: string;
  content: string;
  summary: string | null;
  file_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentAccess {
  id: string;
  document_id: string;
  user_id: string;
  role: DocumentRole;
  created_at: string;
}

export interface SearchResult {
  id: string;
  title: string;
  summary: string | null;
  similarity: number;
}

export interface SummarizeResponse {
  summary: string;
}

export interface SearchResponse {
  results: SearchResult[];
}
