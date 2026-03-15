import { describe, it, expect } from 'vitest';
import type {
  StorageNode,
  ClusterEvent,
  Job,
  ClusterConfig,
  NodeStatus,
  JobStatus,
} from '../../shared/types';

describe('Type definitions', () => {
  it('StorageNode has all required fields', () => {
    const node: StorageNode = {
      id: 'node-0001',
      hostname: 'storage-node-001',
      status: 'healthy',
      diskUsagePercent: 65.4,
      ioThroughputMBps: 250.5,
      lastHeartbeat: new Date().toISOString(),
    };
    expect(node.id).toBe('node-0001');
    expect(node.status).toBe('healthy');
  });

  it('NodeStatus only allows valid values', () => {
    const validStatuses: NodeStatus[] = ['healthy', 'degraded', 'offline'];
    validStatuses.forEach((status) => {
      expect(['healthy', 'degraded', 'offline']).toContain(status);
    });
  });

  it('Job has all required fields', () => {
    const job: Job = {
      id: 'job-1',
      type: 'rebalance',
      name: 'Data Rebalance',
      status: 'running',
      progress: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(job.progress).toBe(45);
    expect(job.status).toBe('running');
  });

  it('JobStatus covers all states', () => {
    const validStatuses: JobStatus[] = ['queued', 'running', 'completed', 'failed', 'cancelled'];
    expect(validStatuses).toHaveLength(5);
  });

  it('ClusterConfig has valid replication factor range', () => {
    const config: ClusterConfig = {
      replicationFactor: 3,
      metadataServers: ['meta-001', 'meta-002'],
      maintenanceMode: false,
      storageTargets: [
        { id: 'target-01', path: '/data/storage01', capacityTB: 150, enabled: true },
      ],
    };
    expect(config.replicationFactor).toBeGreaterThanOrEqual(1);
    expect(config.replicationFactor).toBeLessThanOrEqual(4);
  });

  it('ClusterEvent has severity and type', () => {
    const event: ClusterEvent = {
      id: 'evt-1',
      timestamp: new Date().toISOString(),
      type: 'node_failure',
      severity: 'error',
      message: 'Node went offline',
      nodeId: 'node-0042',
    };
    expect(event.severity).toBe('error');
    expect(event.type).toBe('node_failure');
  });
});
