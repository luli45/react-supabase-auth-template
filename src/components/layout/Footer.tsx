import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Pricing', href: '/pricing' },
    ],
    resources: [
      { label: 'GMAT Prep', href: '/gmat' },
      { label: 'GRE Prep', href: '/gre' },
      { label: 'Blog', href: '/blog' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy', href: '/privacy' },
    ],
  };

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.grid}>
          {/* Brand Column */}
          <div className={styles.brandColumn}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoIcon}>F</span>
              <span className={styles.logoText}>FocusPrep</span>
            </Link>
            <p className={styles.tagline}>
              Study smarter, not harder. AI-powered GMAT/GRE prep designed for how your brain actually works.
            </p>
          </div>

          {/* Links Columns */}
          <div className={styles.linksColumn}>
            <h3 className={styles.columnTitle}>Product</h3>
            <ul className={styles.linkList}>
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={styles.link}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.linksColumn}>
            <h3 className={styles.columnTitle}>Resources</h3>
            <ul className={styles.linkList}>
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={styles.link}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.linksColumn}>
            <h3 className={styles.columnTitle}>Company</h3>
            <ul className={styles.linkList}>
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={styles.link}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {currentYear} FocusPrep. All rights reserved.
          </p>
          <p className={styles.accessibility}>
            Built with accessibility in mind for neurodivergent learners.
          </p>
        </div>
      </div>
    </footer>
  );
}
