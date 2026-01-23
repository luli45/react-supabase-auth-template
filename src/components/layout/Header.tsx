import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import styles from './Header.module.css';

interface HeaderProps {
  sticky?: boolean;
}

export function Header({ sticky = true }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { session } = useSession();
  const location = useLocation();

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  const isLandingPage = location.pathname === '/';

  return (
    <header className={`${styles.header} ${sticky ? styles.sticky : ''}`}>
      <nav className={`container ${styles.nav}`} aria-label="Main navigation">
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon} aria-hidden="true">F</span>
          <span className={styles.logoText}>FocusPrep</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className={`${styles.navList} ${styles.desktopOnly}`}>
          {isLandingPage && navItems.map((item) => (
            <li key={item.href}>
              <a href={item.href} className={styles.navLink}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className={styles.actions}>
          {session ? (
            <Link to="/dashboard" className="btn btn--primary">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth/sign-in" className={`btn btn--ghost ${styles.desktopOnly}`}>
                Sign In
              </Link>
              <Link to="/auth/sign-up" className="btn btn--accent">
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`${styles.mobileMenuBtn} ${styles.mobileOnly}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <span className={styles.menuIcon}></span>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className={styles.mobileMenu}>
          <ul className={styles.mobileNavList}>
            {isLandingPage && navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            {!session && (
              <li>
                <Link
                  to="/auth/sign-in"
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
