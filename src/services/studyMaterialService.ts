import supabase from '../supabase';
import type { StudyMaterial, FileType } from '../types/studyMaterial';

const BUCKET_NAME = 'study-materials';

function getFileType(fileName: string): FileType {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'pdf';
    case 'docx':
    case 'doc':
      return 'docx';
    case 'txt':
      return 'txt';
    case 'md':
    case 'markdown':
      return 'md';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return 'image';
    default:
      return 'txt';
  }
}

export const studyMaterialService = {
  async getMaterials(): Promise<StudyMaterial[]> {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMaterial(id: string): Promise<StudyMaterial | null> {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async uploadMaterial(title: string, file: File): Promise<StudyMaterial> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileType = getFileType(file.name);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Create the record first with 'uploading' status
    const { data: material, error: insertError } = await supabase
      .from('study_materials')
      .insert({
        user_id: user.id,
        title,
        file_name: file.name,
        file_type: fileType,
        file_size: file.size,
        file_url: '', // Will update after upload
        status: 'uploading',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    try {
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      // Update record with URL and processing status
      const { data: updatedMaterial, error: updateError } = await supabase
        .from('study_materials')
        .update({
          file_url: urlData.publicUrl,
          status: 'processing',
        })
        .eq('id', material.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedMaterial;
    } catch (error) {
      // Update status to error if upload fails
      await supabase
        .from('study_materials')
        .update({
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Upload failed',
        })
        .eq('id', material.id);
      throw error;
    }
  },

  async updateMaterialText(id: string, extractedText: string): Promise<StudyMaterial> {
    const { data, error } = await supabase
      .from('study_materials')
      .update({
        extracted_text: extractedText,
        status: 'ready',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMaterialSummary(id: string, summary: string): Promise<StudyMaterial> {
    const { data, error } = await supabase
      .from('study_materials')
      .update({ summary })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMaterialStatus(
    id: string,
    status: StudyMaterial['status'],
    errorMessage?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('study_materials')
      .update({
        status,
        error_message: errorMessage || null,
      })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteMaterial(id: string): Promise<void> {
    // Get the material to find the file URL
    const material = await this.getMaterial(id);
    if (!material) return;

    // Delete from storage if file exists
    if (material.file_url) {
      const filePath = material.file_url.split(`${BUCKET_NAME}/`)[1];
      if (filePath) {
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
