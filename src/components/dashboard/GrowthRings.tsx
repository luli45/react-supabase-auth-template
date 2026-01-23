import styles from './GrowthRings.module.css';

interface GrowthRingsProps {
  /** Progress value between 0 and 1 */
  progress: number;
  /** Size in pixels */
  size?: number;
  /** Label text shown below */
  label?: string;
  /** Current streak or count */
  value?: string | number;
}

export function GrowthRings({
  progress,
  size = 120,
  label,
  value
}: GrowthRingsProps) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedProgress * circumference);

  return (
    <div className={styles.container} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={styles.svg}
        role="progressbar"
        aria-valuenow={Math.round(normalizedProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-elevated)"
          strokeWidth={strokeWidth}
          className={styles.backgroundRing}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-secondary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={styles.progressRing}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Inner glow effect */}
        {normalizedProgress > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius * 0.7}
            fill="var(--color-secondary)"
            opacity={0.1}
            className={styles.innerGlow}
          />
        )}
      </svg>
      <div className={styles.content}>
        {value !== undefined && (
          <span className={styles.value}>{value}</span>
        )}
        {label && (
          <span className={styles.label}>{label}</span>
        )}
      </div>
    </div>
  );
}

interface GrowthRingsGroupProps {
  rings: Array<{
    progress: number;
    label: string;
    value?: string | number;
    color?: string;
  }>;
}

export function GrowthRingsGroup({ rings }: GrowthRingsGroupProps) {
  return (
    <div className={styles.group}>
      {rings.map((ring, index) => (
        <GrowthRings
          key={index}
          progress={ring.progress}
          label={ring.label}
          value={ring.value}
          size={100}
        />
      ))}
    </div>
  );
}
