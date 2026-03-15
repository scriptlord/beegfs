import { Router } from 'express';
import { store } from '../store.js';
import { getNodeCount, isVirtualMode } from '../state.js';
import type { StorageNode, NodeStatus } from '../../shared/types.js';

const router = Router();

// Deterministic node generator for virtual mode — same page always returns same data
function generateVirtualNode(index: number): StorageNode {
  const i = index + 1;
  const id = `node-${String(i).padStart(7, '0')}`;
  const hostname = `storage-node-${String(i).padStart(7, '0')}`;

  // Use index as seed for deterministic but varied data
  const seed = (i * 2654435761) >>> 0; // Knuth multiplicative hash
  const s1 = (seed % 1000) / 1000;
  const s2 = ((seed >>> 10) % 1000) / 1000;
  const s3 = ((seed >>> 20) % 1000) / 1000;

  let status: NodeStatus;
  if (s1 < 0.03) status = 'offline';
  else if (s1 < 0.10) status = 'degraded';
  else status = 'healthy';

  const diskUsagePercent = Math.round(Math.max(5, Math.min(98, 40 + s2 * 50)) * 10) / 10;

  let ioThroughputMBps: number;
  if (status === 'offline') ioThroughputMBps = 0;
  else if (status === 'degraded') ioThroughputMBps = Math.round((10 + s3 * 90) * 10) / 10;
  else ioThroughputMBps = Math.round((50 + s3 * 450) * 10) / 10;

  const heartbeatOffset = status === 'offline'
    ? 3600_000 + s3 * 82800_000
    : status === 'degraded'
    ? 60_000 + s3 * 540_000
    : 1_000 + s3 * 29_000;

  return {
    id,
    hostname,
    status,
    diskUsagePercent,
    ioThroughputMBps,
    lastHeartbeat: new Date(Date.now() - heartbeatOffset).toISOString(),
  };
}

router.get('/', (req, res) => {
  const { search, sortBy, sortDir, page = '1', pageSize = '25' } = req.query as Record<string, string>;
  const totalCount = getNodeCount();
  const virtual = isVirtualMode();

  const p = Math.max(1, Number(page));
  const ps = Math.max(1, Math.min(1000, Number(pageSize)));

  if (virtual) {
    // Virtual mode: generate nodes on-the-fly for the requested page
    if (search) {
      // Search in virtual mode: can only search by index pattern
      const results: StorageNode[] = [];
      const q = search.toLowerCase();
      // Search first 10000 nodes for matches (limit to keep it fast)
      const searchLimit = Math.min(totalCount, 10000);
      for (let i = 0; i < searchLimit; i++) {
        const node = generateVirtualNode(i);
        if (node.id.includes(q) || node.hostname.includes(q)) {
          results.push(node);
          if (results.length >= ps) break;
        }
      }
      res.json({ data: results, total: results.length, page: 1, pageSize: ps, totalPages: 1 });
      return;
    }

    // Generate the requested page on-the-fly
    const startIdx = (p - 1) * ps;
    const data: StorageNode[] = [];
    for (let i = startIdx; i < Math.min(startIdx + ps, totalCount); i++) {
      data.push(generateVirtualNode(i));
    }

    res.json({
      data,
      total: totalCount,
      page: p,
      pageSize: ps,
      totalPages: Math.ceil(totalCount / ps),
    });
    return;
  }

  // Real mode: use in-memory nodes
  let nodes = [...store.nodes];

  if (search) {
    const q = search.toLowerCase();
    nodes = nodes.filter(
      (n) => n.id.toLowerCase().includes(q) || n.hostname.toLowerCase().includes(q)
    );
  }

  if (sortBy && nodes.length > 0 && sortBy in nodes[0]) {
    const dir = sortDir === 'desc' ? -1 : 1;
    nodes.sort((a, b) => {
      const av = a[sortBy as keyof StorageNode];
      const bv = b[sortBy as keyof StorageNode];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }

  const total = nodes.length;
  const sliced = nodes.slice((p - 1) * ps, p * ps);

  res.json({ data: sliced, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) });
});

export default router;
