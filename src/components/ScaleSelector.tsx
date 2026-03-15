import { useState, useEffect } from 'react';
import { useAlert } from '../hooks/useAlert';
import styles from './ScaleSelector.module.css';

interface ScaleInfo {
  currentCount: number;
  isVirtual: boolean;
  presets: { label: string; count: number }[];
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ScaleSelector({ onScaleChange }: { onScaleChange?: () => void }) {
  const [scale, setScale] = useState<ScaleInfo | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { addAlert } = useAlert();

  useEffect(() => {
    fetch(`${BASE_URL}/scale`).then((r) => r.json()).then(setScale).catch(() => {});
  }, []);

  async function handleScale(count: number, label: string) {
    setLoading(label);
    setStatusMessage(`Scaling cluster to ${count.toLocaleString()} nodes...`);
    try {
      const res = await fetch(`${BASE_URL}/scale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      setScale((prev) => prev ? { ...prev, currentCount: data.currentCount, isVirtual: data.isVirtual } : prev);
      setStatusMessage(`Scaled to ${data.currentCount.toLocaleString()} nodes`);
      addAlert('success', data.message);
      if (onScaleChange) onScaleChange();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      addAlert('error', 'Failed to change scale');
      setStatusMessage(null);
    } finally {
      setLoading(null);
    }
  }

  if (!scale) return null;

  return (
    <div className={styles.container}>
      <div className={styles.label}>
        Cluster Scale:
        <span className={styles.current}>
          {scale.currentCount.toLocaleString()} nodes
  {}
        </span>
      </div>
      <div className={styles.buttons}>
        {scale.presets.map((preset) => (
          <button
            key={preset.count}
            className={`${styles.btn} ${scale.currentCount === preset.count ? styles.btnActive : ''}`}
            onClick={() => handleScale(preset.count, preset.label)}
            disabled={loading !== null}
          >
            {loading === preset.label ? '...' : preset.label}
          </button>
        ))}
      </div>
      {statusMessage && (
        <div className={styles.status}>
          {loading ? '⏳' : '✓'} {statusMessage}
        </div>
      )}
    </div>
  );
}
