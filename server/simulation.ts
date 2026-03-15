import { store } from './store.js';
import { generateSingleEvent, randomBetween } from './generators.js';
import { getNodeCount, isVirtualMode } from './routes/scale.js';
import type { NodeStatus, ClusterSummary } from '../shared/types.js';

type BroadcastFn = (event: string, data: unknown) => void;

const statuses: NodeStatus[] = ['healthy', 'degraded', 'offline'];

export function buildClusterSummary(): ClusterSummary {
  const nodes = store.nodes;
  const totalCount = getNodeCount();

  // Compute ratios from real nodes, then scale up
  const healthyRatio = nodes.filter((n) => n.status === 'healthy').length / nodes.length;
  const degradedRatio = nodes.filter((n) => n.status === 'degraded').length / nodes.length;

  const healthyNodes = Math.round(healthyRatio * totalCount);
  const degradedNodes = Math.round(degradedRatio * totalCount);
  const offlineNodes = totalCount - healthyNodes - degradedNodes;
  const activeNodes = healthyNodes + degradedNodes;

  const totalCapacityTB = Math.round(totalCount * 0.5); // 0.5 TB per node
  const avgUsage = nodes.reduce((sum, n) => sum + n.diskUsagePercent, 0) / nodes.length;
  const storageUsedTB = Math.round((avgUsage / 100) * totalCapacityTB * 10) / 10;

  let clusterHealth: 'green' | 'yellow' | 'red';
  if (offlineNodes > 10 || degradedNodes > 50) clusterHealth = 'red';
  else if (offlineNodes > 0 || degradedNodes > 10) clusterHealth = 'yellow';
  else clusterHealth = 'green';

  // Disk usage distribution buckets (active nodes only — offline nodes aren't serving data)
  const activeNodesList = nodes.filter((n) => n.status !== 'offline');
  const buckets = [
    { range: '0-25%', min: 0, max: 25 },
    { range: '25-50%', min: 25, max: 50 },
    { range: '50-75%', min: 50, max: 75 },
    { range: '75-90%', min: 75, max: 90 },
    { range: '90-100%', min: 90, max: 100 },
  ];
  const activeScale = activeNodes / (activeNodesList.length || 1);
  const diskUsageDistribution = buckets.map((b) => ({
    range: b.range,
    count: Math.round(activeNodesList.filter((n) => n.diskUsagePercent >= b.min && n.diskUsagePercent < b.max).length * activeScale),
  }));

  return {
    totalNodes: nodes.length,
    activeNodes,
    healthyNodes,
    degradedNodes,
    offlineNodes,
    storageUsedTB,
    storageTotalTB: totalCapacityTB,
    clusterHealth,
    throughputHistory: [...store.throughputHistory],
    diskUsageDistribution,
  };
}

export function startSimulation(broadcast: BroadcastFn) {
  return setInterval(() => {
    // 1. Mutate 5-15 random nodes (no duplicates per tick)
    const mutCount = Math.floor(randomBetween(5, 15));
    const mutated = new Set<number>();
    for (let i = 0; i < mutCount; i++) {
      let idx: number;
      do { idx = Math.floor(Math.random() * store.nodes.length); } while (mutated.has(idx));
      mutated.add(idx);
      const node = store.nodes[idx];
      const prevStatus = node.status;

      if (Math.random() < 0.3) {
        const currentIdx = statuses.indexOf(node.status);
        if (Math.random() < 0.6) {
          node.status = 'healthy';
        } else {
          node.status = statuses[(currentIdx + 1) % statuses.length];
        }
      }

      node.diskUsagePercent = Math.max(1, Math.min(99, node.diskUsagePercent + randomBetween(-2, 2)));
      node.diskUsagePercent = Math.round(node.diskUsagePercent * 10) / 10;

      if (node.status === 'offline') {
        node.ioThroughputMBps = 0;
      } else if (node.status === 'degraded') {
        node.ioThroughputMBps = Math.round(randomBetween(10, 100) * 10) / 10;
      } else {
        node.ioThroughputMBps = Math.max(0, Math.round((node.ioThroughputMBps + randomBetween(-30, 30)) * 10) / 10);
      }

      if (node.status !== 'offline') {
        node.lastHeartbeat = new Date().toISOString();
      }

      // Broadcast individual node update
      broadcast('node:update', { nodeId: node.id, node: { ...node } });

      // Generate alerts for status transitions
      if (prevStatus !== 'offline' && node.status === 'offline') {
        broadcast('alert:new', {
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          severity: 'error',
          message: `Node ${node.hostname} went offline — check: power, network, service status`,
          timestamp: new Date().toISOString(),
        });
      }

      if (prevStatus === 'offline' && node.status !== 'offline') {
        broadcast('alert:new', {
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          severity: 'success',
          message: `Node ${node.hostname} is back online`,
          timestamp: new Date().toISOString(),
        });
      }

      if (prevStatus !== 'degraded' && node.status === 'degraded') {
        broadcast('alert:new', {
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          severity: 'warning',
          message: `Node ${node.hostname} is degraded — check: disk I/O errors, network latency, memory usage`,
          timestamp: new Date().toISOString(),
        });
      }

      if (node.diskUsagePercent > 90 && Math.random() < 0.1) {
        broadcast('alert:new', {
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          severity: 'warning',
          message: `Disk usage on ${node.hostname} at ${node.diskUsagePercent}% — check: cleanup old files, expand storage`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // 2. Append throughput data point
    const last = store.throughputHistory[store.throughputHistory.length - 1];
    store.throughputHistory.push({
      timestamp: new Date().toISOString(),
      readMBps: Math.max(0, Math.round(((last?.readMBps ?? 2500) + randomBetween(-200, 200)))),
      writeMBps: Math.max(0, Math.round(((last?.writeMBps ?? 1800) + randomBetween(-150, 150)))),
    });
    if (store.throughputHistory.length > 60) {
      store.throughputHistory.shift();
    }

    // 3. Generate 0-2 new events
    const eventCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < eventCount; i++) {
      const evt = generateSingleEvent(getNodeCount());
      store.events.unshift(evt);
      broadcast('event:new', evt);
    }
    if (store.events.length > 200) {
      store.events.length = 200;
    }

    // 4. Advance jobs
    const runningJobs = store.jobs.filter((j) => j.status === 'running');
    for (const job of runningJobs) {
      job.progress = Math.min(100, job.progress + randomBetween(2, 8));
      job.progress = Math.round(job.progress * 10) / 10;
      job.updatedAt = new Date().toISOString();

      // 5% chance of failure per tick
      if (Math.random() < 0.05 && job.progress < 100) {
        job.status = 'failed';
        job.error = 'Unexpected error during execution';
        job.updatedAt = new Date().toISOString();
        broadcast('alert:new', {
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          severity: 'error',
          message: `Job "${job.name}" failed at ${Math.round(job.progress)}% — check: server logs, retry the job`,
          timestamp: new Date().toISOString(),
        });
        broadcast('job:update', { ...job });
        continue;
      }

      if (job.progress >= 100) {
        job.status = 'completed';
        job.progress = 100;
        broadcast('alert:new', {
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          severity: 'success',
          message: `Job "${job.name}" completed successfully`,
          timestamp: new Date().toISOString(),
        });
      }

      broadcast('job:update', { ...job });
    }

    // Start queued jobs
    const queuedJobs = store.jobs.filter((j) => j.status === 'queued');
    if (runningJobs.length === 0 && queuedJobs.length > 0) {
      const job = queuedJobs[0];
      job.status = 'running';
      job.updatedAt = new Date().toISOString();
      broadcast('job:update', { ...job });
    }

    // 5. Broadcast full cluster summary
    broadcast('cluster:update', buildClusterSummary());
  }, 3000);
}
