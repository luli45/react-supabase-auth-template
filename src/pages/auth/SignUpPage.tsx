import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import supabase from "../../supabase";

const SignUpPage = () => {
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
    setStatus("Creating account...");
    setError("");
    const { error } = await supabase.auth.signUp({
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
          <h1 style={{ marginBottom: 'var(--spacing-2)', textAlign: 'center' }}>Create Account</h1>
          <p className="text-center text-muted" style={{ marginBottom: 'var(--spacing-6)', fontSize: 'var(--font-size-sm)' }}>
            Start your neuro-adaptive study journey
          </p>

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
                placeholder="Choose a secure password"
                className={`input ${error ? 'input--error' : ''}`}
                minLength={6}
                required
              />
            </div>

            {error && (
              <p style={{ color: 'var(--color-error)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn btn--accent" disabled={!!status} style={{ width: '100%' }}>
              {status || 'Create Account'}
            </button>

            <p className="text-center text-muted" style={{ margin: 0 }}>
              Already have an account?{' '}
              <Link to="/auth/sign-in" style={{ color: 'var(--color-primary)' }}>
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default SignUpPage;
