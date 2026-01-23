import { Link } from "react-router-dom";
import supabase from "../supabase";
import { useSession } from "../context/SessionContext";

const HomePage = () => {
  const { session } = useSession();

  return (
    <main className="container section">
      <div className="text-center" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: 'var(--spacing-4)' }}>FocusPrep</h1>
        <p className="text-secondary" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-8)' }}>
          Your neuro-adaptive study companion for GMAT &amp; GRE preparation
        </p>

        {session ? (
          <div className="card" style={{ textAlign: 'left' }}>
            <p style={{ marginBottom: 'var(--spacing-4)' }}>
              Welcome back, <strong>{session.user.email}</strong>
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
              <Link to="/documents" className="btn btn--accent">
                My Documents
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className="btn btn--ghost"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth/sign-in" className="btn btn--primary btn--large">
              Sign In
            </Link>
            <Link to="/auth/sign-up" className="btn btn--secondary btn--large">
              Create Account
            </Link>
          </div>
        )}

        <div style={{ marginTop: 'var(--spacing-12)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>
            Designed for how your brain works
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-4)',
            textAlign: 'left'
          }}>
            <div className="card card--bordered">
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-2)', color: 'var(--color-secondary-dark)' }}>
                Low Friction
              </h3>
              <p className="text-muted" style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                Start studying in seconds, not minutes
              </p>
            </div>
            <div className="card card--bordered">
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-2)', color: 'var(--color-secondary-dark)' }}>
                Sensory Friendly
              </h3>
              <p className="text-muted" style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                Calm colors, clear typography
              </p>
            </div>
            <div className="card card--bordered">
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-2)', color: 'var(--color-secondary-dark)' }}>
                Your Pace
              </h3>
              <p className="text-muted" style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                15-minute micro-study blocks
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
