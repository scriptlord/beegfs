import { useState } from 'react';
import type { ClusterEvent, EventSeverity } from '../types';
import styles from './EventLog.module.css';

const severityColors: Record<EventSeverity, string> = {
  info: 'var(--color-info)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

const filters: { label: string; value: EventSeverity | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
];

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}

interface Props {
  events: ClusterEvent[];
  newEventIds?: Set<string>;
}

export default function EventLog({ events, newEventIds }: Props) {
  const [filter, setFilter] = useState<EventSeverity | 'all'>('all');

  const filtered = filter === 'all' ? events : events.filter((e) => e.severity === filter);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot} />
          <span className={styles.liveText}>Live</span>
        </div>
        {filters.map((f) => (
          <button
            key={f.value}
            className={`${styles.filterBtn} ${filter === f.value ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className={styles.list}>
        {filtered.map((event) => (
          <div
            key={event.id}
            className={`${styles.event} ${newEventIds?.has(event.id) ? styles.eventNew : ''}`}
          >
            <div className={styles.dot} style={{ background: severityColors[event.severity] }} />
            <div className={styles.timestamp}>{formatTimestamp(event.timestamp)}</div>
            <div className={styles.message}>{event.message}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No events found
          </div>
        )}
      </div>
    </div>
  );
}
