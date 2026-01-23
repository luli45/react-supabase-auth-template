import { Link } from 'react-router-dom';
import styles from './CTASection.module.css';

export function CTASection() {
  return (
    <section className={styles.section} aria-labelledby="cta-heading">
      <div className={`container ${styles.container}`}>
        <div className={styles.content}>
          <h2 id="cta-heading" className={styles.title}>
            Ready to Study Without the Struggle?
          </h2>
          <p className={styles.subtitle}>
            Join thousands of neurodivergent learners who've reclaimed their focus
            and achieved their target scores.
          </p>
          <div className={styles.ctas}>
            <Link to="/auth/sign-up" className="btn btn--accent btn--large">
              Start Your Free Trial
            </Link>
            <Link to="/contact" className="btn btn--ghost btn--large" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Contact Sales
            </Link>
          </div>
          <p className={styles.guarantee}>
            14-day free trial &bull; No credit card required &bull; Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
