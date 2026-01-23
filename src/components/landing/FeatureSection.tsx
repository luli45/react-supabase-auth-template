import styles from './FeatureSection.module.css';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  benefits: string[];
}

const features: Feature[] = [
  {
    id: 'audio-podcasts',
    icon: 'headphones',
    title: 'Turn Dense Textbooks into On-the-Go Podcasts',
    description: "Don't let a 500-page manual trigger a shutdown. Our AI scrapes the most relevant content and converts it into high-quality audio you can listen to while walking, driving, or doing chores.",
    benefits: [
      'Variable playback speed (0.5x - 2.5x)',
      'Synchronized transcripts',
      'Skip controls for quick navigation',
      'Offline listening support',
    ],
  },
  {
    id: 'content-scraping',
    icon: 'filter',
    title: 'Filter the Noise. Focus on the Signal.',
    description: "We scrape the latest insights from Reddit and top prep sites to see what's actually on the exam right now. No fluff, no outdated chapters\u2014just the content that matters.",
    benefits: [
      'Reddit r/GMAT and r/GRE integration',
      'AI-curated relevance scoring',
      'Real-time exam trend analysis',
      'Duplicate detection',
    ],
  },
  {
    id: 'neuro-adaptive',
    icon: 'brain',
    title: 'Built for How Your Brain Actually Works',
    description: 'Designed from the ground up for neurodivergent learners. Sensory-friendly interface, distraction-free design, and study sessions that respect your cognitive limits.',
    benefits: [
      '15-minute micro-study blocks',
      'One-click start (no decision fatigue)',
      'Progress without pressure',
      'Reduced motion and visual noise',
    ],
  },
];

export function FeatureSection() {
  return (
    <section id="features" className={`section ${styles.section}`} aria-labelledby="features-heading">
      <div className="container">
        <div className={styles.header}>
          <h2 id="features-heading" className={styles.title}>
            Study Smarter, Not Harder
          </h2>
          <p className={styles.subtitle}>
            Your brain isn't broken\u2014the test is just built for a different operating system.
            We change the test content to fit your brain.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature) => (
            <div key={feature.id} className={styles.card}>
              <div className={styles.iconWrapper} aria-hidden="true">
                <FeatureIcon type={feature.icon} />
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
              <ul className={styles.benefits}>
                {feature.benefits.map((benefit, index) => (
                  <li key={index} className={styles.benefit}>
                    <span className={styles.checkIcon} aria-hidden="true">&#10003;</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    headphones: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
    filter: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
    brain: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54" />
      </svg>
    ),
  };

  return icons[type] || null;
}
