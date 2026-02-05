import { Link } from 'react-router-dom';
import { useRef, FC, ReactNode } from 'react';
import { motion, MotionValue, useScroll, useTransform } from 'framer-motion';
import styles from './Hero.module.css';
import { cn } from '../../utils/cn';

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className={styles.wordWrapper}>
      <span className={styles.wordShadow}>{children}</span>
      <motion.span style={{ opacity }} className={styles.wordReveal}>
        {children}
      </motion.span>
    </span>
  );
};

interface TextRevealProps {
  text: string;
  className?: string;
}

const TextReveal: FC<TextRevealProps> = ({ text, className }) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const words = text.split(' ');

  return (
    <div ref={targetRef} className={cn(styles.textRevealContainer, className)}>
      <div className={styles.textRevealSticky}>
        <p className={styles.textRevealContent}>
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
};

export function Hero() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={`container ${styles.container}`}>
          <div className={styles.content}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon} aria-hidden="true">*</span>
              <span>Designed for Neurodivergent Learners</span>
            </div>

            <h1 id="hero-heading" className={styles.title}>
              Eliminate GMAT/GRE Task Paralysis and{' '}
              <span className={styles.highlight}>Reclaim Your Focus</span>
            </h1>

            <p className={styles.subtitle}>
              Stop fighting your brain. Our AI-powered platform transforms dense study materials
              into neuro-adaptive podcasts and high-signal summaries designed for ADHD and Autistic learners.
            </p>

            <div className={styles.ctas}>
              <Link to="/auth/sign-up" className="btn btn--accent btn--large">
                Start Your Free Trial
              </Link>
              <a href="#features" className="btn btn--secondary btn--large">
                See How It Works
              </a>
            </div>

            <p className={styles.microcopy}>
              Free access for students &bull; No credit card required &bull; Cancel anytime
            </p>
          </div>

          <div className={styles.visual} aria-hidden="true">
            <div className={styles.mockup}>
              <div className={styles.mockupHeader}>
                <span className={styles.mockupDot}></span>
                <span className={styles.mockupDot}></span>
                <span className={styles.mockupDot}></span>
              </div>
              <div className={styles.mockupContent}>
                <div className={styles.audioPlayer}>
                  <div className={styles.playerInfo}>
                    <div className={styles.playerTitle}>GMAT Verbal: Critical Reasoning</div>
                    <div className={styles.playerSubtitle}>Episode 3 of 12</div>
                  </div>
                  <div className={styles.playerControls}>
                    <button className={styles.skipBtn} aria-label="Skip back 15 seconds">-15s</button>
                    <button className={styles.playBtn} aria-label="Play">
                      <span className={styles.playIcon}></span>
                    </button>
                    <button className={styles.skipBtn} aria-label="Skip forward 30 seconds">+30s</button>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progress}></div>
                  </div>
                  <div className={styles.speedControl}>1.5x</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TextReveal
        text="Transform overwhelming study materials into digestible audio. Learn at your own pace. Finally feel in control of your test prep journey."
        className={styles.revealSection}
      />
    </>
  );
}
