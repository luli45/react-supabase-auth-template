export interface Document {
  id: string;
  user_id: string;
  title: string;
  content: unknown;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentInput {
  title?: string;
  content?: unknown;
}

export interface UpdateDocumentInput {
  title?: string;
  content?: unknown;
}
