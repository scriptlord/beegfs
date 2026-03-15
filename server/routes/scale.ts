import { Router } from 'express';
import { store } from '../store.js';
import { generateNodes } from '../generators.js';
import { broadcast } from '../ws/handler.js';
import { getNodeCount, isVirtualMode, setNodeCount } from '../state.js';
import { buildClusterSummary } from '../simulation.js';

const router = Router();

const PRESETS = [
  { label: '1K', count: 1_000 },
  { label: '10K', count: 10_000 },
  { label: '100K', count: 100_000 },
  { label: '1M', count: 1_000_000 },
  { label: '1B', count: 1_000_000_000 },
];

router.get('/', (_req, res) => {
  res.json({
    currentCount: getNodeCount(),
    isVirtual: isVirtualMode(),
    presets: PRESETS,
  });
});

router.post('/', (req, res) => {
  const { count } = req.body as { count: number };
  if (!count || count < 1) {
    res.status(400).json({ error: 'Invalid count' });
    return;
  }

  const MAX_IN_MEMORY = 100_000;

  if (count <= MAX_IN_MEMORY) {
    console.log(`Generating ${count.toLocaleString()} nodes in memory...`);
    const start = Date.now();
    store.nodes = generateNodes(count);
    setNodeCount(count, false);
    console.log(`Done in ${Date.now() - start}ms`);
  } else {
    console.log(`Switching to virtual mode: ${count.toLocaleString()} nodes`);
    store.nodes = generateNodes(1000);
    setNodeCount(count, true);
  }

  broadcast('scale:changed', { count: getNodeCount(), isVirtual: isVirtualMode() });
  broadcast('cluster:update', buildClusterSummary());

  res.json({
    currentCount: getNodeCount(),
    isVirtual: isVirtualMode(),
    message: `Cluster scaled to ${getNodeCount().toLocaleString()} nodes${isVirtualMode() ? ' (virtual)' : ''}`,
  });
});

export default router;
