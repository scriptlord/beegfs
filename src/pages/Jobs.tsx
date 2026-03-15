import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import type { Job, JobType } from '../types';
import JobTracker from '../components/JobTracker';
import { useAlert } from '../hooks/useAlert';

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const { addAlert } = useAlert();

  useEffect(() => {
    api.getJobs().then(setJobs).catch(() => {});

    const unsub = wsService.subscribe('job:update', (job: Job) => {
      setJobs((prev) => {
        const idx = prev.findIndex((j) => j.id === job.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = job;
          return next;
        }
        return [job, ...prev];
      });
    });

    return unsub;
  }, []);

  async function handleCreate(type: JobType) {
    try {
      await api.createJob(type);
    } catch {
      addAlert('error', 'Failed to create job');
    }
  }

  async function handleCancel(id: string) {
    try {
      await api.cancelJob(id);
    } catch {
      addAlert('error', 'Failed to cancel job');
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Jobs</h2>
      <JobTracker jobs={jobs} onCreateJob={handleCreate} onCancelJob={handleCancel} />
    </div>
  );
}
