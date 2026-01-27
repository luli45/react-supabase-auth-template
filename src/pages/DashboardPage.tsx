import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useDocuments } from '../hooks/useDocuments';
import supabase from '../supabase';
import './DashboardPage.css';

export default function DashboardPage() {
  const { session } = useSession();
  const { documents, createDocument } = useDocuments();
  const navigate = useNavigate();

  const firstName = session?.user?.email?.split('@')[0] || 'there';

  // Get the most recent document for "Resume" functionality
  const recentDoc = documents[0];

  const handleQuickStart = async () => {
    if (recentDoc) {
      navigate(`/documents/${recentDoc.id}`);
    } else {
      // Create a new document and navigate to it
      const doc = await createDocument('Quick Study Session');
      navigate(`/documents/${doc.id}`);
    }
  };

  const handleNewDocument = async () => {
    const doc = await createDocument('New Document');
    navigate(`/documents/${doc.id}`);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <div className="dashboard-header-content">
            <Link to="/" className="dashboard-logo">
              {/* Logo using Accent Color */}
              <div className="dashboard-logo-icon" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>F</div>
              <span className="dashboard-logo-text">FocusPrep</span>
            </Link>
            <div className="dashboard-header-actions">
              <button
                onClick={() => supabase.auth.signOut()}
                className="btn btn--ghost btn--small"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          {/* Welcome Section */}
          <section className="dashboard-welcome">
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Good afternoon, {firstName}.</h1>
            <p className="text-secondary" style={{ color: 'var(--color-secondary)' }}>
              Ready to continue your work?
            </p>
          </section>

          {/* Bento Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridAutoRows: 'minmax(180px, auto)',
            gap: 'var(--spacing-md)',
            marginTop: 'var(--spacing-xl)'
          }}>

            {/* Quick Start Card (Main) - Spans 8 cols */}
            <div className="glass-card" style={{
              gridColumn: 'span 8',
              padding: 'var(--spacing-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-xs)' }}>
                  {recentDoc ? `Resume "${recentDoc.title}"` : 'Start writing'}
                </h2>
                <p style={{ color: 'var(--color-secondary)' }}>
                  {recentDoc ? `Last edited ${new Date(recentDoc.updated_at).toLocaleDateString()}` : 'Create your first document to get started.'}
                </p>
              </div>
              <button
                onClick={handleQuickStart}
                className="btn"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  alignSelf: 'start',
                  marginTop: 'var(--spacing-md)',
                  padding: '10px 24px'
                }}
              >
                {recentDoc ? 'Continue Editing' : 'Create Document'}
              </button>
            </div>

            {/* Study Stats / Progress - Spans 4 cols */}
            <div className="glass-card" style={{
              gridColumn: 'span 4',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--color-secondary)', marginBottom: 'var(--spacing-md)' }}>Weekly Goal</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>15</span>
                <span style={{ color: 'var(--color-tertiary)' }}>/ 40 mins</span>
              </div>
              <div style={{
                height: '6px',
                backgroundColor: 'var(--color-surface-active)',
                borderRadius: '99px',
                marginTop: 'var(--spacing-md)',
                overflow: 'hidden'
              }}>
                <div style={{ width: '35%', height: '100%', backgroundColor: 'var(--color-accent)' }}></div>
              </div>
            </div>

            {/* Tools Grid - Spans 12 cols (Row 2) */}

            {/* Read & Write */}
            <div className="glass-card" onClick={handleNewDocument} style={{
              gridColumn: 'span 4',
              padding: 'var(--spacing-lg)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)'
            }}>
              <div style={{
                width: '40px', height: '40px',
                background: 'var(--color-surface-active)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </div>
              <h3 style={{ fontSize: '1.1rem' }}>Read & Write</h3>
              <p style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>Detailed note taking.</p>
            </div>

            {/* Mindmap (Graph) */}
            <Link to="/graph" className="glass-card" style={{
              gridColumn: 'span 4',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)'
            }}>
              <div style={{
                width: '40px', height: '40px',
                background: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </div>
              <h3 style={{ fontSize: '1.1rem' }}>Mindmap</h3>
              <p style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>Visualize your knowledge graph.</p>
            </Link>

            {/* Research */}
            <Link to="/research" className="glass-card" style={{
              gridColumn: 'span 4',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)'
            }}>
              <div style={{
                width: '40px', height: '40px',
                background: 'var(--color-surface-active)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
              <h3 style={{ fontSize: '1.1rem' }}>Research</h3>
              <p style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>Capture content from the web.</p>
            </Link>

          </div>

          {/* Recent Documents List */}
          <section className="dashboard-recent" style={{ marginTop: 'var(--spacing-xl)' }}>
            <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-md)' }}>Recent Notes</h2>
            {documents.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-tertiary)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px border var(--color-border)' }}>
                No documents found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                {documents.slice(0, 5).map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/documents/${doc.id}`}
                    className="glass-card"
                    style={{
                      padding: 'var(--spacing-md)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-md)'
                    }}
                  >
                    <div style={{ color: 'var(--color-tertiary)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    </div>
                    <span style={{ fontWeight: '500' }}>{doc.title}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--color-tertiary)', fontSize: '0.8rem' }}>{new Date(doc.updated_at).toLocaleDateString()}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
