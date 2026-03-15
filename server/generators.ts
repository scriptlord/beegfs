import type {
  StorageNode,
  NodeStatus,
  ThroughputDataPoint,
  ClusterEvent,
  EventType,
  EventSeverity,
  ClusterConfig,
  Job,
  JobType,
} from '../shared/types.js';

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function bellRandom(center: number, spread: number): number {
  const sum = (Math.random() + Math.random() + Math.random()) / 3;
  return center + (sum - 0.5) * 2 * spread;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let eventIdCounter = 0;

export function generateNodes(count: number): StorageNode[] {
  const now = Date.now();
  const nodes: StorageNode[] = [];

  for (let i = 1; i <= count; i++) {
    const roll = Math.random();
    let status: NodeStatus;
    if (roll < 0.03) status = 'offline';
    else if (roll < 0.10) status = 'degraded';
    else status = 'healthy';

    const diskUsage = Math.max(5, Math.min(98, bellRandom(65, 25)));
    let throughput: number;
    let heartbeatOffset: number;

    if (status === 'offline') {
      throughput = 0;
      heartbeatOffset = randomBetween(3600_000, 86400_000);
    } else if (status === 'degraded') {
      throughput = randomBetween(10, 100);
      heartbeatOffset = randomBetween(60_000, 600_000);
    } else {
      throughput = randomBetween(50, 500);
      heartbeatOffset = randomBetween(1_000, 30_000);
    }

    nodes.push({
      id: `node-${pad(i, 4)}`,
      hostname: `storage-node-${pad(i, 3)}`,
      status,
      diskUsagePercent: Math.round(diskUsage * 10) / 10,
      ioThroughputMBps: Math.round(throughput * 10) / 10,
      lastHeartbeat: new Date(now - heartbeatOffset).toISOString(),
    });
  }

  return nodes;
}

export function generateThroughputHistory(points: number): ThroughputDataPoint[] {
  const now = Date.now();
  const data: ThroughputDataPoint[] = [];

  for (let i = points - 1; i >= 0; i--) {
    const t = now - i * 5000;
    const phase = (i / points) * Math.PI * 4;
    const readBase = 2500 + Math.sin(phase) * 800;
    const writeBase = 1800 + Math.cos(phase) * 600;

    data.push({
      timestamp: new Date(t).toISOString(),
      readMBps: Math.round(readBase + randomBetween(-200, 200)),
      writeMBps: Math.round(writeBase + randomBetween(-150, 150)),
    });
  }

  return data;
}

const eventTemplates: {
  type: EventType;
  severity: EventSeverity;
  messageFn: (nodeId: string) => string;
}[] = [
  { type: 'node_joined', severity: 'info', messageFn: (id) => `Node ${id} joined the cluster` },
  { type: 'disk_capacity_warning', severity: 'warning', messageFn: (id) => `Disk usage on ${id} reached ${Math.round(randomBetween(85, 98))}%` },
  { type: 'storage_pool_expanded', severity: 'info', messageFn: () => `Storage pool 'default' expanded by ${Math.round(randomBetween(2, 16))} TB` },
  { type: 'node_failure', severity: 'error', messageFn: (id) => `Node ${id} is unreachable` },
];

export function generateSingleEvent(nodeCount?: number): ClusterEvent {
  const template = pickRandom(eventTemplates);
  const maxNode = nodeCount || 1000;
  const padWidth = Math.max(3, String(maxNode).length);
  const nodeId = `storage-node-${pad(Math.floor(randomBetween(1, maxNode + 1)), padWidth)}`;
  eventIdCounter++;

  return {
    id: `evt-${eventIdCounter}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: template.type,
    severity: template.severity,
    message: template.messageFn(nodeId),
    nodeId: template.type !== 'storage_pool_expanded' ? nodeId : undefined,
  };
}

export function generateEvents(count: number): ClusterEvent[] {
  const now = Date.now();
  const events: ClusterEvent[] = [];

  for (let i = 0; i < count; i++) {
    const template = pickRandom(eventTemplates);
    const nodeId = `storage-node-${pad(Math.floor(randomBetween(1, 1000)), 3)}`;
    const timeOffset = randomBetween(0, 86400_000);
    eventIdCounter++;

    events.push({
      id: `evt-${eventIdCounter}-${now - timeOffset}`,
      timestamp: new Date(now - timeOffset).toISOString(),
      type: template.type,
      severity: template.severity,
      message: template.messageFn(nodeId),
      nodeId: template.type !== 'storage_pool_expanded' ? nodeId : undefined,
    });
  }

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events;
}

export function generateConfig(): ClusterConfig {
  return {
    replicationFactor: 3,
    metadataServers: ['meta-server-001', 'meta-server-002'],
    maintenanceMode: false,
    storageTargets: [
      { id: 'target-01', path: '/data/beegfs/storage01', capacityTB: 150, enabled: true },
      { id: 'target-02', path: '/data/beegfs/storage02', capacityTB: 150, enabled: true },
      { id: 'target-03', path: '/data/beegfs/storage03', capacityTB: 100, enabled: true },
      { id: 'target-04', path: '/data/beegfs/storage04', capacityTB: 100, enabled: false },
    ],
  };
}

const jobNames: Record<JobType, string> = {
  rebalance: 'Data Rebalance',
  pool_expansion: 'Storage Pool Expansion',
  health_check: 'Cluster Health Check',
};

export function createJob(type: JobType): Job {
  const now = new Date().toISOString();
  return {
    id: `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    name: jobNames[type],
    status: 'queued',
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };
}
