import { Link, useNavigate } from 'react-router-dom';
import { useDocuments } from '../../hooks/useDocuments';
import { useSession } from '../../context/SessionContext';
import './documents.css';

export default function DocumentsListPage() {
  const { session } = useSession();
  const { documents, isLoading, error, createDocument, deleteDocument } = useDocuments();
  const navigate = useNavigate();

  const handleCreateNew = async () => {
    try {
      const doc = await createDocument('New Document');
      navigate(`/documents/${doc.id}`);
    } catch (err) {
      console.error('Failed to create document:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(id);
    }
  };

  if (isLoading) {
    return (
      <main className="container section">
        <div className="loading-container">
          <p>Loading documents...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container section">
        <div className="error-container">
          <h2>Error loading documents</h2>
          <p>{error.message}</p>
          <Link to="/" className="btn btn--secondary">Go Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container section">
      <Link className="back-link" to="/dashboard">
        Dashboard
      </Link>
      <section className="documents-container">
        <div className="documents-header">
          <h1>My Documents</h1>
          <p>Logged in as: {session?.user.email}</p>
        </div>

        <button onClick={handleCreateNew} className="btn btn--accent create-document-btn">
          + New Document
        </button>

        <div className="documents-list">
          {documents.length === 0 ? (
            <div className="no-documents">
              <p>No documents yet</p>
              <p className="text-muted">Create your first document to get started</p>
            </div>
          ) : (
            documents.map((doc) => (
              <Link
                key={doc.id}
                to={`/documents/${doc.id}`}
                className="document-card"
              >
                <div className="document-info">
                  <h3>{doc.title}</h3>
                  <span className="document-date">
                    Updated: {new Date(doc.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="document-actions">
                  <button
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
