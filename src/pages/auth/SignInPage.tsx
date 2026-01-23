import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import supabase from "../../supabase";

const SignInPage = () => {
  const { session } = useSession();
  if (session) return <Navigate to="/" />;

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Signing in...");
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: formValues.email,
      password: formValues.password,
    });
    if (error) {
      setError(error.message);
    }
    setStatus("");
  };

  return (
    <main className="container section">
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Link className="back-link" to="/" style={{ marginBottom: 'var(--spacing-6)', display: 'inline-flex' }}>
          Home
        </Link>

        <div className="card">
          <h1 style={{ marginBottom: 'var(--spacing-6)', textAlign: 'center' }}>Sign In</h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-medium)' }}>
                Email
              </label>
              <input
                id="email"
                name="email"
                onChange={handleInputChange}
                type="email"
                placeholder="you@example.com"
                className={`input ${error ? 'input--error' : ''}`}
                required
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-medium)' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                onChange={handleInputChange}
                type="password"
                placeholder="Your password"
                className={`input ${error ? 'input--error' : ''}`}
                required
              />
            </div>

            {error && (
              <p style={{ color: 'var(--color-error)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn btn--primary" disabled={!!status} style={{ width: '100%' }}>
              {status || 'Sign In'}
            </button>

            <p className="text-center text-muted" style={{ margin: 0 }}>
              Don't have an account?{' '}
              <Link to="/auth/sign-up" style={{ color: 'var(--color-primary)' }}>
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default SignInPage;
