export type FileType = 'pdf' | 'docx' | 'txt' | 'md' | 'image';

export interface StudyMaterial {
  id: string;
  user_id: string;
  title: string;
  file_name: string;
  file_type: FileType;
  file_size: number;
  file_url: string;
  extracted_text: string | null;
  summary: string | null;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStudyMaterialInput {
  title: string;
  file: File;
}

export interface StudyMaterialMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  material_id: string;
  messages: StudyMaterialMessage[];
  created_at: string;
  updated_at: string;
}

export interface AskQuestionInput {
  materialId: string;
  question: string;
  conversationHistory?: StudyMaterialMessage[];
}

export interface SummarizeInput {
  materialId: string;
  style?: 'brief' | 'detailed' | 'bullet-points';
}
