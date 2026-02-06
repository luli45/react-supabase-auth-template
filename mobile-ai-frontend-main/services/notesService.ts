import { supabase } from './supabase';

export interface DrawingElement {
  id: string;
  type: 'path' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'triangle' | 'sticker' | 'text';
  color: string;
  strokeWidth: number;
  points?: { x: number; y: number }[];
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  rotation?: number;
  scale?: number;
  text?: string;
  fontSize?: number;
  stickerId?: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  elements: DrawingElement[];
  canvas_width: number;
  canvas_height: number;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  title: string;
  elements?: DrawingElement[];
  canvas_width?: number;
  canvas_height?: number;
}

export interface UpdateNoteInput {
  title?: string;
  elements?: DrawingElement[];
  thumbnail_url?: string;
}

class NotesService {
  private tableName = 'notes';

  async createNote(input: CreateNoteInput): Promise<Note | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        user_id: user.id,
        title: input.title,
        elements: input.elements || [],
        canvas_width: input.canvas_width || 1080,
        canvas_height: input.canvas_height || 1920,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return null;
    }

    return data;
  }

  async getNotes(): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return [];
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return [];
    }

    return data || [];
  }

  async getNoteById(id: string): Promise<Note | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching note:', error);
      return null;
    }

    return data;
  }

  async updateNote(id: string, input: UpdateNoteInput): Promise<Note | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      return null;
    }

    return data;
  }

  async deleteNote(id: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting note:', error);
      return false;
    }

    return true;
  }

  async duplicateNote(id: string): Promise<Note | null> {
    const note = await this.getNoteById(id);
    if (!note) return null;

    return this.createNote({
      title: `${note.title} (Copy)`,
      elements: note.elements,
      canvas_width: note.canvas_width,
      canvas_height: note.canvas_height,
    });
  }
}

export const notesService = new NotesService();
