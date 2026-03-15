import { Router } from 'express';
import { store } from '../store.js';
import { generateNodes } from '../generators.js';
import { broadcast } from '../ws/handler.js';
import { buildClusterSummary } from '../simulation.js';

const router = Router();

// Available scale presets
const PRESETS = [
  { label: '1K', count: 1_000 },
  { label: '10K', count: 10_000 },
  { label: '100K', count: 100_000 },
  { label: '1M', count: 1_000_000 },
  { label: '1B', count: 1_000_000_000 },
];

// For counts > 100K, we use virtual node generation (on-the-fly)
// instead of storing all nodes in memory.
let virtualNodeCount = store.nodes.length;
let useVirtualNodes = false;

router.get('/', (_req, res) => {
  res.json({
    currentCount: useVirtualNodes ? virtualNodeCount : store.nodes.length,
    isVirtual: useVirtualNodes,
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
    // Generate real nodes in memory
    console.log(`Generating ${count.toLocaleString()} nodes in memory...`);
    const start = Date.now();
    store.nodes = generateNodes(count);
    useVirtualNodes = false;
    virtualNodeCount = count;
    console.log(`Done in ${Date.now() - start}ms`);
  } else {
    // Virtual mode: keep a small set in memory, generate pages on-the-fly
    console.log(`Switching to virtual mode: ${count.toLocaleString()} nodes`);
    store.nodes = generateNodes(1000); // Keep 1000 real nodes for simulation
    useVirtualNodes = true;
    virtualNodeCount = count;
  }

  broadcast('scale:changed', { count: virtualNodeCount, isVirtual: useVirtualNodes });
  // Immediately broadcast updated cluster summary so dashboard reflects new scale
  broadcast('cluster:update', buildClusterSummary());

  res.json({
    currentCount: virtualNodeCount,
    isVirtual: useVirtualNodes,
    message: `Cluster scaled to ${virtualNodeCount.toLocaleString()} nodes${useVirtualNodes ? ' (virtual)' : ''}`,
  });
});

export function getNodeCount(): number {
  return virtualNodeCount;
}

export function isVirtualMode(): boolean {
  return useVirtualNodes;
}

export default router;
