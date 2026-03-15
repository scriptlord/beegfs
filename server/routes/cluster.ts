import { Router } from 'express';
import { store } from '../store.js';
import { getNodeCount } from './scale.js';

const router = Router();

router.get('/', (_req, res) => {
  const nodes = store.nodes;
  const totalCount = getNodeCount();

  const healthyRatio = nodes.filter((n) => n.status === 'healthy').length / nodes.length;
  const degradedRatio = nodes.filter((n) => n.status === 'degraded').length / nodes.length;

  const healthyNodes = Math.round(healthyRatio * totalCount);
  const degradedNodes = Math.round(degradedRatio * totalCount);
  const offlineNodes = totalCount - healthyNodes - degradedNodes;
  const activeNodes = healthyNodes + degradedNodes;

  const totalCapacityTB = Math.round(totalCount * 0.5);
  const avgUsage = nodes.reduce((sum, n) => sum + n.diskUsagePercent, 0) / nodes.length;
  const storageUsedTB = Math.round((avgUsage / 100) * totalCapacityTB * 10) / 10;

  let clusterHealth: 'green' | 'yellow' | 'red';
  if (offlineNodes > 10 || degradedNodes > 50) clusterHealth = 'red';
  else if (offlineNodes > 0 || degradedNodes > 10) clusterHealth = 'yellow';
  else clusterHealth = 'green';

  const activeNodesList = nodes.filter((n) => n.status !== 'offline');
  const activeScale = activeNodes / (activeNodesList.length || 1);
  const buckets = [
    { range: '0-25%', min: 0, max: 25 },
    { range: '25-50%', min: 25, max: 50 },
    { range: '50-75%', min: 50, max: 75 },
    { range: '75-90%', min: 75, max: 90 },
    { range: '90-100%', min: 90, max: 100 },
  ];
  const diskUsageDistribution = buckets.map((b) => ({
    range: b.range,
    count: Math.round(activeNodesList.filter((n) => n.diskUsagePercent >= b.min && n.diskUsagePercent < b.max).length * activeScale),
  }));

  res.json({
    totalNodes: totalCount,
    activeNodes,
    healthyNodes,
    degradedNodes,
    offlineNodes,
    storageUsedTB,
    storageTotalTB: totalCapacityTB,
    clusterHealth,
    throughputHistory: store.throughputHistory,
    diskUsageDistribution,
  });
});

export default router;
