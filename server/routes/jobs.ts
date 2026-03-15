import { Router } from 'express';
import { store } from '../store.js';
import { broadcast } from '../ws/handler.js';
import { createJob } from '../generators.js';
import type { JobType } from '../../shared/types.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(store.jobs);
});

router.post('/', (req, res) => {
  const { type } = req.body as { type: JobType };
  const job = createJob(type);
  store.jobs.push(job);
  broadcast('job:update', job);
  res.status(201).json(job);
});

router.delete('/:id', (req, res) => {
  const job = store.jobs.find((j) => j.id === req.params.id);
  if (!job) { res.status(404).json({ error: 'Not found' }); return; }
  if (job.status !== 'queued' && job.status !== 'running') {
    res.status(400).json({ error: 'Cannot cancel a finished job' }); return;
  }
  job.status = 'cancelled';
  job.updatedAt = new Date().toISOString();
  broadcast('job:update', job);
  res.json(job);
});

export default router;
