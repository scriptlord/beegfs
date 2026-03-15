import { Router } from 'express';
import { store } from '../store.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(store.config);
});

router.post('/', (req, res) => {
  Object.assign(store.config, req.body);
  res.json(store.config);
});

export default router;
