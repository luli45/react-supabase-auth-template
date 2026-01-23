import styles from './SocialProof.module.css';

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: '10,000+', label: 'Active Students' },
  { value: '89%', label: 'Report Reduced Anxiety' },
  { value: '4.8/5', label: 'User Rating' },
  { value: '150+', label: 'Point Avg. Improvement' },
];

export function SocialProof() {
  return (
    <section className={styles.section} aria-label="Platform statistics">
      <div className="container">
        <div className={styles.grid}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <span className={styles.value}>{stat.value}</span>
              <span className={styles.label}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
