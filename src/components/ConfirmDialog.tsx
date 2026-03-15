import styles from './ConfirmDialog.module.css';

interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, variant = 'danger' }: Props) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>{title}</div>
        <div className={styles.message}>{message}</div>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={`${styles.confirmBtn} ${styles[variant]}`} onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
