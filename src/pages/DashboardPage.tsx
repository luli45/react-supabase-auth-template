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
              <span className="dashboard-logo-icon">F</span>
              <span className="dashboard-logo-text">FocusPrep</span>
            </Link>
            <div className="dashboard-header-actions">
              <button
                onClick={() => supabase.auth.signOut()}
                className="btn btn--ghost btn--small"
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
              <p className="text-secondary">
                Let's simplify your study session. Pick a mode below to get started.
              </p>
            </div>
          </section>

          {/* Quick Start Section - The "Next Step" */}
          <section className="dashboard-quickstart">
            <div className="quickstart-card">
              <div className="quickstart-content">
                <h2>Continue Your Journey</h2>
                <p>
                  {recentDoc
                    ? `Resume "${recentDoc.title}" from your last session`
                    : 'Start your first study session'}
                </p>
              </div>
              <button
                onClick={handleQuickStart}
                className="btn btn--accent btn--large quickstart-btn"
              >
                {recentDoc ? 'Resume Session' : 'Start Now'}
              </button>
            </div>
          </section>

          {/* Progress Overview with Growth Rings */}
          <section className="dashboard-progress">
            <h2 className="section-title">Your Progress</h2>
            <p className="section-subtitle">
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
            <p className="progress-encouragement">
              {progressData.streak > 0
                ? `${progressData.streak} day streak! Keep the momentum going.`
                : 'Start today and build your streak!'}
            </p>
          </section>

          {/* Study Mode Selection */}
          <section className="dashboard-modes">
            <h2 className="section-title">Choose Your Mode</h2>
            <p className="section-subtitle">
              How do you want to study today?
            </p>
            <div className="mode-cards mode-cards--three">
              <Link to="/study" className="mode-card">
                <div className="mode-icon mode-icon--accent">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    <path d="M12 6v4M10 8h4" />
                  </svg>
                </div>
                <h3>AI Study Assistant</h3>
                <p>Upload materials, get summaries, and ask questions</p>
              </Link>

              <button className="mode-card" onClick={handleNewDocument}>
                <div className="mode-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <h3>Read & Write</h3>
                <p>Take notes, highlight key concepts, and organize your thoughts</p>
              </button>

              <button className="mode-card mode-card--coming-soon" disabled>
                <div className="mode-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
                <h3>Listen</h3>
                <p>Audio podcasts for learning on the go</p>
                <span className="coming-soon-badge">Coming Soon</span>
              </button>
            </div>
          </section>

          {/* Recent Documents */}
          <section className="dashboard-recent">
            <div className="section-header">
              <div>
                <h2 className="section-title">Recent Documents</h2>
                <p className="section-subtitle">Pick up where you left off</p>
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
                  >
                    <div className="recent-card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="recent-card-content">
                      <h3>{doc.title}</h3>
                      <span className="recent-card-date">
                        {new Date(doc.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Micro-Study Tip */}
          <section className="dashboard-tip">
            <div className="tip-card">
              <span className="tip-icon" aria-hidden="true">💡</span>
              <div className="tip-content">
                <h3>15-Minute Power Session</h3>
                <p>
                  Research shows that short, focused study sessions are more effective than long cramming.
                  Try a 15-minute session today!
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
