import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudyMaterials } from '../../hooks/useStudyMaterials';
import { getAcceptString } from '../../utils/documentParser';
import './study.css';

const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: '📄',
  docx: '📝',
  txt: '📃',
  md: '📋',
  image: '🖼️',
};

export default function StudyMaterialsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    materials,
    isLoading,
    error,
    uploadMaterial,
    deleteMaterial,
    uploadProgress,
  } = useStudyMaterials();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    setShowUploadModal(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle.trim() || isUploading) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const material = await uploadMaterial(uploadTitle.trim(), selectedFile);
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadTitle('');
      // Navigate to the study page
      navigate(`/study/${material.id}`);
    } catch (err) {
      console.error('Upload failed:', err);
      const message = err instanceof Error ? err.message : 'Upload failed';
      // Check for common RLS error
      if (message.includes('row-level security') || message.includes('RLS')) {
        setUploadError('Permission denied. Please check that database policies are configured correctly.');
      } else {
        setUploadError(message);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    if (isUploading) return; // Don't close while uploading
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadTitle('');
    setUploadError(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this study material?')) {
      await deleteMaterial(id);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="study-page">
      <header className="study-header">
        <div className="container">
          <div className="study-header-content">
            <Link to="/dashboard" className="back-link">
              Dashboard
            </Link>
            <h1>Study Materials</h1>
          </div>
        </div>
      </header>

      <main className="study-main">
        <div className="container">
          {/* Upload Area */}
          <section className="upload-section">
            <div
              className={`upload-dropzone ${isDragging ? 'upload-dropzone--active' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={getAcceptString()}
                onChange={handleInputChange}
                className="upload-input"
              />
              <div className="upload-icon">📁</div>
              <h3>Drop your study materials here</h3>
              <p>or click to browse</p>
              <span className="upload-formats">
                Supports PDF, DOCX, TXT, MD, and images
              </span>
            </div>
          </section>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="upload-progress">
              <div className="upload-progress-bar">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
              <span className="upload-progress-text">{uploadProgress.status}</span>
            </div>
          )}

          {/* Materials List */}
          <section className="materials-section">
            <h2>Your Materials</h2>

            {isLoading ? (
              <div className="loading-state">Loading materials...</div>
            ) : error ? (
              <div className="error-state">
                <p>Failed to load materials</p>
                <p className="error-message">{error.message}</p>
              </div>
            ) : materials.length === 0 ? (
              <div className="empty-state">
                <p>No study materials yet</p>
                <p className="text-muted">Upload your first document to get started</p>
              </div>
            ) : (
              <div className="materials-grid">
                {materials.map((material) => (
                  <Link
                    key={material.id}
                    to={`/study/${material.id}`}
                    className={`material-card ${material.status === 'processing' ? 'material-card--processing' : ''}`}
                  >
                    <div className="material-icon">
                      {FILE_TYPE_ICONS[material.file_type] || '📄'}
                    </div>
                    <div className="material-info">
                      <h3>{material.title}</h3>
                      <div className="material-meta">
                        <span className="material-type">{material.file_type.toUpperCase()}</span>
                        <span className="material-size">{formatFileSize(material.file_size)}</span>
                      </div>
                      {material.status === 'processing' && (
                        <span className="material-status">Processing...</span>
                      )}
                      {material.status === 'error' && (
                        <span className="material-status material-status--error">
                          Error: {material.error_message}
                        </span>
                      )}
                    </div>
                    <button
                      className="material-delete"
                      onClick={(e) => handleDelete(material.id, e)}
                      aria-label="Delete material"
                    >
                      ×
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Upload Study Material</h2>
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="material-title">Title</label>
                <input
                  id="material-title"
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter a title for this material"
                  className="input"
                  autoFocus
                  disabled={isUploading}
                />
              </div>
              {selectedFile && (
                <div className="selected-file">
                  <span>{FILE_TYPE_ICONS[selectedFile.name.split('.').pop() || 'txt']}</span>
                  <span>{selectedFile.name}</span>
                  <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                </div>
              )}
              {uploadError && (
                <div className="upload-error">
                  {uploadError}
                </div>
              )}
              {isUploading && uploadProgress && (
                <div className="upload-progress-inline">
                  <div className="upload-progress-bar">
                    <div
                      className="upload-progress-fill"
                      style={{ width: `${uploadProgress.progress}%` }}
                    />
                  </div>
                  <span className="upload-progress-text">{uploadProgress.status}</span>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="btn btn--ghost"
                onClick={handleCloseModal}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                className="btn btn--accent"
                onClick={handleUpload}
                disabled={!uploadTitle.trim() || !selectedFile || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload & Study'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
