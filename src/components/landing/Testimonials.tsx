import styles from './Testimonials.module.css';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  score?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    quote: "I spent three years stuck in task paralysis. Every other prep course felt like it was written in a language I didn't speak. FocusPrep finally 'clicked' because it let me study without sitting still for four hours.",
    author: 'Jordan M.',
    role: 'Data Analyst',
    score: 'GMAT 720',
  },
  {
    id: '2',
    quote: "The audio podcasts are a game-changer. I can study during my commute, and the variable speed control means I can go at my own pace. It's like having a tutor who actually gets how my brain works.",
    author: 'Alex R.',
    role: 'Software Engineer',
    score: 'GRE 328',
  },
  {
    id: '3',
    quote: "For the first time, I don't dread studying. The interface is clean, calm, and doesn't overwhelm me with notifications. It respects my need for focus and low stimulation.",
    author: 'Sam K.',
    role: 'Marketing Manager',
    score: 'GMAT 680',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className={`section ${styles.section}`} aria-labelledby="testimonials-heading">
      <div className="container">
        <div className={styles.header}>
          <h2 id="testimonials-heading" className={styles.title}>
            What Our Students Say
          </h2>
          <p className={styles.subtitle}>
            Real results from learners who thought they couldn't do it.
          </p>
        </div>

        <div className={styles.grid} role="list">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className={styles.card} role="listitem">
              <blockquote className={styles.quote}>
                <p>"{testimonial.quote}"</p>
              </blockquote>
              <footer className={styles.footer}>
                <div className={styles.avatar} aria-hidden="true">
                  {testimonial.author.charAt(0)}
                </div>
                <div className={styles.authorInfo}>
                  <cite className={styles.author}>{testimonial.author}</cite>
                  <span className={styles.role}>{testimonial.role}</span>
                </div>
                {testimonial.score && (
                  <span className={styles.score}>{testimonial.score}</span>
                )}
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
