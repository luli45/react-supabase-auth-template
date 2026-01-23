import { useState, useEffect, useCallback } from 'react';
import { studyMaterialService } from '../services/studyMaterialService';
import { parseDocument, type ParseProgress } from '../utils/documentParser';
import type { StudyMaterial } from '../types/studyMaterial';

interface UseStudyMaterialsResult {
  materials: StudyMaterial[];
  isLoading: boolean;
  error: Error | null;
  uploadMaterial: (title: string, file: File) => Promise<StudyMaterial>;
  deleteMaterial: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
  uploadProgress: ParseProgress | null;
}

export function useStudyMaterials(): UseStudyMaterialsResult {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [uploadProgress, setUploadProgress] = useState<ParseProgress | null>(null);

  const fetchMaterials = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await studyMaterialService.getMaterials();
      setMaterials(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch materials'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const uploadMaterial = useCallback(async (title: string, file: File): Promise<StudyMaterial> => {
    setUploadProgress({ status: 'Uploading file...', progress: 0 });

    // Upload to Supabase
    const material = await studyMaterialService.uploadMaterial(title, file);

    // Parse document to extract text
    setUploadProgress({ status: 'Processing document...', progress: 20 });

    const parseResult = await parseDocument(file, (progress) => {
      setUploadProgress({
        status: progress.status,
        progress: 20 + (progress.progress * 0.7), // 20-90%
      });
    });

    if (parseResult.error) {
      await studyMaterialService.updateMaterialStatus(material.id, 'error', parseResult.error);
      throw new Error(parseResult.error);
    }

    // Update material with extracted text
    setUploadProgress({ status: 'Saving...', progress: 95 });
    const updatedMaterial = await studyMaterialService.updateMaterialText(material.id, parseResult.text);

    setUploadProgress({ status: 'Complete!', progress: 100 });

    // Add to local state
    setMaterials((prev) => [updatedMaterial, ...prev]);

    // Clear progress after a delay
    setTimeout(() => setUploadProgress(null), 1500);

    return updatedMaterial;
  }, []);

  const deleteMaterial = useCallback(async (id: string) => {
    await studyMaterialService.deleteMaterial(id);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    materials,
    isLoading,
    error,
    uploadMaterial,
    deleteMaterial,
    refetch: fetchMaterials,
    uploadProgress,
  };
}

interface UseStudyMaterialResult {
  material: StudyMaterial | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useStudyMaterial(id: string | undefined): UseStudyMaterialResult {
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMaterial = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await studyMaterialService.getMaterial(id);
      setMaterial(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch material'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMaterial();
  }, [fetchMaterial]);

  return {
    material,
    isLoading,
    error,
    refetch: fetchMaterial,
  };
}
