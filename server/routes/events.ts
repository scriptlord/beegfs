import { Router } from 'express';
import { store } from '../store.js';

const router = Router();

router.get('/', (req, res) => {
  const { severity } = req.query as Record<string, string>;
  let events = store.events;
  if (severity) {
    events = events.filter((e) => e.severity === severity);
  }
  res.json(events);
});

export default router;
