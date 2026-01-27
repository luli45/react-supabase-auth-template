import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import type { FileType } from '../types/studyMaterial';

// Set up PDF.js worker from public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export interface ParseResult {
  text: string;
  pageCount?: number;
  error?: string;
}

export interface ParseProgress {
  status: string;
  progress: number;
}

type ProgressCallback = (progress: ParseProgress) => void;

/**
 * Parse a PDF file and extract text content
 */
async function parsePDF(
  file: File,
  onProgress?: ProgressCallback
): Promise<ParseResult> {
  try {
    onProgress?.({ status: 'Loading PDF...', progress: 0 });

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const textParts: string[] = [];
    const totalPages = pdf.numPages;

    for (let i = 1; i <= totalPages; i++) {
      onProgress?.({
        status: `Extracting page ${i} of ${totalPages}...`,
        progress: (i / totalPages) * 100,
      });

      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');

      textParts.push(pageText);
    }

    onProgress?.({ status: 'Complete', progress: 100 });

    return {
      text: textParts.join('\n\n'),
      pageCount: totalPages,
    };
  } catch (error) {
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Failed to parse PDF',
    };
  }
}

/**
 * Parse a DOCX file and extract text content
 */
async function parseDOCX(
  file: File,
  onProgress?: ProgressCallback
): Promise<ParseResult> {
  try {
    onProgress?.({ status: 'Loading document...', progress: 0 });

    const arrayBuffer = await file.arrayBuffer();

    onProgress?.({ status: 'Extracting text...', progress: 50 });

    const result = await mammoth.extractRawText({ arrayBuffer });

    onProgress?.({ status: 'Complete', progress: 100 });

    return {
      text: result.value,
    };
  } catch (error) {
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Failed to parse DOCX',
    };
  }
}

/**
 * Parse a text or markdown file
 */
async function parseText(
  file: File,
  onProgress?: ProgressCallback
): Promise<ParseResult> {
  try {
    onProgress?.({ status: 'Reading file...', progress: 50 });

    const text = await file.text();

    onProgress?.({ status: 'Complete', progress: 100 });

    return { text };
  } catch (error) {
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Failed to read file',
    };
  }
}

/**
 * Parse an image file using OCR
 */
async function parseImage(
  file: File,
  onProgress?: ProgressCallback
): Promise<ParseResult> {
  try {
    onProgress?.({ status: 'Initializing OCR...', progress: 0 });

    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          onProgress?.({
            status: 'Recognizing text...',
            progress: m.progress * 100,
          });
        }
      },
    });

    onProgress?.({ status: 'Complete', progress: 100 });

    return {
      text: result.data.text,
    };
  } catch (error) {
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Failed to process image',
    };
  }
}

/**
 * Get the file type from a file name
 */
export function getFileTypeFromName(fileName: string): FileType {
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

/**
 * Parse a document and extract text based on file type
 */
export async function parseDocument(
  file: File,
  onProgress?: ProgressCallback
): Promise<ParseResult> {
  const fileType = getFileTypeFromName(file.name);

  switch (fileType) {
    case 'pdf':
      return parsePDF(file, onProgress);
    case 'docx':
      return parseDOCX(file, onProgress);
    case 'txt':
    case 'md':
      return parseText(file, onProgress);
    case 'image':
      return parseImage(file, onProgress);
    default:
      return parseText(file, onProgress);
  }
}

/**
 * Get supported file extensions
 */
export function getSupportedExtensions(): string[] {
  return ['.pdf', '.docx', '.doc', '.txt', '.md', '.png', '.jpg', '.jpeg', '.gif', '.webp'];
}

/**
 * Get the accept string for file input
 */
export function getAcceptString(): string {
  return '.pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.gif,.webp';
}
