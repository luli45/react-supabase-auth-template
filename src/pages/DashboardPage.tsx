import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useDocuments } from '../hooks/useDocuments';
import { GrowthRingsGroup } from '../components/dashboard/GrowthRings';
import supabase from '../supabase';
import './DashboardPage.css';

export default function DashboardPage() {
  const { session } = useSession();
  const { documents, isLoading, createDocument } = useDocuments();
  const navigate = useNavigate();

  const firstName = session?.user?.email?.split('@')[0] || 'there';

  // Get the most recent document for "Resume" functionality
  const recentDoc = documents[0];

  // Mock progress data (would come from user's study progress)
  const progressData = {
    todayMinutes: 15,
    weeklyGoal: 0.4, // 40% of weekly goal
    totalSessions: 12,
    streak: 3,
  };

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
            <div className="welcome-text">
              <h1>Ready to focus, {firstName}?</h1>
              <p className="text-secondary" style={{ color: 'var(--color-text-subtle)', maxWidth: '600px', fontSize: '1.2rem' }}>
                Your brain is ready. Let's find your flow.
              </p>
            </div>
          </section>

          {/* Quick Start Section - The "Next Step" */}
          <section className="dashboard-quickstart">
            <div className="quickstart-card" style={{ boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="quickstart-content">
                <h2>Continue Your Journey</h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem' }}>
                  {recentDoc
                    ? `Resume "${recentDoc.title}"`
                    : 'Start your first study session'}
                </p>
              </div>
              <button
                onClick={handleQuickStart}
                className="btn btn--accent btn--large quickstart-btn"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-primary)',
                  fontWeight: '700',
                  boxShadow: 'var(--shadow-md)',
                  border: '2px solid transparent'
                }}
              >
                {recentDoc ? 'Resume Session' : 'Start Now'}
              </button>
            </div>
          </section>

          {/* Progress Overview with Growth Rings */}
          <section className="dashboard-progress">
            <h2 className="section-title">Your Progress</h2>
            <p className="section-subtitle" style={{ color: 'var(--color-text-subtle)' }}>
              Growth happens in small steps. Here's how you're doing.
            </p>
            <div className="progress-rings">
              <GrowthRingsGroup
                rings={[
                  {
                    progress: progressData.todayMinutes / 60,
                    label: 'Today',
                    value: `${progressData.todayMinutes}m`,
                  },
                  {
                    progress: progressData.weeklyGoal,
                    label: 'This Week',
                    value: `${Math.round(progressData.weeklyGoal * 100)}%`,
                  },
                  {
                    progress: progressData.streak / 7,
                    label: 'Streak',
                    value: progressData.streak,
                  },
                ]}
              />
            </div>
          </section>

          {/* Study Mode Selection */}
          <section className="dashboard-modes">
            <h2 className="section-title">Choose Your Mode</h2>
            <div className="mode-cards mode-cards--three">
              <Link to="/research" className="mode-card" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="mode-icon" style={{ color: 'var(--color-primary)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h3>Research</h3>
                <p>Scrape websites for distraction-free reading.</p>
              </Link>

              <Link to="/study" className="mode-card" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="mode-icon mode-icon--accent" style={{ color: 'var(--color-secondary)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <h3>AI Study Assistant</h3>
                <p>Upload materials, get summaries, and ask questions.</p>
              </Link>

              <button className="mode-card" onClick={handleNewDocument} style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="mode-icon" style={{ color: 'var(--color-primary)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <h3>Read & Write</h3>
                <p>Distraction-free note taking and highlighting.</p>
              </button>

              <Link to="/listen" className="mode-card" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="mode-icon" style={{ color: 'var(--color-text-subtle)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
                <h3>Listen</h3>
                <p>Turn notes into neuro-adaptive podcasts.</p>
              </Link>
            </div>
          </section>

          {/* Recent Documents */}
          <section className="dashboard-recent">
            <div className="section-header">
              <div>
                <h2 className="section-title">Recent Documents</h2>
              </div>
              <Link to="/documents" className="btn btn--ghost btn--small">
                View All
              </Link>
            </div>

            {isLoading ? (
              <div className="loading-placeholder">Loading...</div>
            ) : documents.length === 0 ? (
              <div className="empty-state">
                <p>No documents yet. Create your first one to get started!</p>
                <button onClick={handleNewDocument} className="btn btn--secondary">
                  Create Document
                </button>
              </div>
            ) : (
              <div className="recent-list">
                {documents.slice(0, 4).map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/documents/${doc.id}`}
                    className="recent-card"
                    style={{ borderRadius: 'var(--radius-md)', border: '1px solid transparent' }}
                  >
                    <div className="recent-card-icon" style={{ color: 'var(--color-secondary)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="recent-card-content">
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{doc.title}</h3>
                      <span className="recent-card-date" style={{ color: 'var(--color-text-subtle)' }}>
                        {new Date(doc.updated_at).toLocaleDateString()}
                      </span>
                    </div>
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
