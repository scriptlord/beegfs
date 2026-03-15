import { useState } from 'react';
import type { Job, JobType } from '../types';
import ConfirmDialog from './ConfirmDialog';
import styles from './JobTracker.module.css';

interface Props {
  jobs: Job[];
  onCreateJob: (type: JobType) => void;
  onCancelJob: (id: string) => void;
}

const jobTypes: { type: JobType; label: string }[] = [
  { type: 'rebalance', label: 'Data Rebalance' },
  { type: 'pool_expansion', label: 'Pool Expansion' },
  { type: 'health_check', label: 'Health Check' },
];

const statusColors: Record<string, string> = {
  queued: 'var(--color-text-muted)',
  running: 'var(--color-primary)',
  completed: 'var(--color-healthy)',
  failed: 'var(--color-offline)',
  cancelled: 'var(--color-text-muted)',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString();
}

export default function JobTracker({ jobs, onCreateJob, onCancelJob }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Job | null>(null);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.createWrapper}>
          <button className={styles.createBtn} onClick={() => setShowMenu(!showMenu)}>
            + Create Job
          </button>
          {showMenu && (
            <div className={styles.dropdown}>
              {jobTypes.map((jt) => (
                <button
                  key={jt.type}
                  className={styles.dropdownItem}
                  onClick={() => { onCreateJob(jt.type); setShowMenu(false); }}
                >
                  {jt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {jobs.length === 0 && (
        <div className={styles.empty}>No jobs yet. Create one to get started.</div>
      )}

      <div className={styles.list}>
        {jobs.map((job) => (
          <div key={job.id} className={styles.jobItem}>
            <div className={styles.jobHeader}>
              <div className={styles.jobName}>{job.name}</div>
              <span className={styles.statusBadge} style={{ color: statusColors[job.status] }}>
                {job.status}
              </span>
            </div>

            {job.status === 'running' && (
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${job.progress}%` }}
                />
                <span className={styles.progressText}>{Math.round(job.progress)}%</span>
              </div>
            )}

            {job.error && <div className={styles.error}>{job.error}</div>}

            <div className={styles.jobMeta}>
              <span>Created: {formatTime(job.createdAt)}</span>
              {(job.status === 'queued' || job.status === 'running') && (
                <button className={styles.cancelBtn} onClick={() => setCancelTarget(job)}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancel Job"
        message={`Are you sure you want to cancel "${cancelTarget?.name}"? This may leave the cluster in an inconsistent state.`}
        variant="danger"
        onConfirm={() => { if (cancelTarget) onCancelJob(cancelTarget.id); setCancelTarget(null); }}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
