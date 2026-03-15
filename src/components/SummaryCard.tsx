import styles from './SummaryCard.module.css';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export default function SummaryCard({ title, value, subtitle, variant = 'default' }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      <div className={`${styles.value} ${styles[variant]}`}>{value}</div>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
    </div>
  );
}
