export type NodeStatus = 'healthy' | 'degraded' | 'offline';

export interface StorageNode {
  id: string;
  hostname: string;
  status: NodeStatus;
  diskUsagePercent: number;
  ioThroughputMBps: number;
  lastHeartbeat: string;
}

export interface ThroughputDataPoint {
  timestamp: string;
  readMBps: number;
  writeMBps: number;
}

export interface ClusterSummary {
  totalNodes: number;
  activeNodes: number;
  healthyNodes: number;
  degradedNodes: number;
  offlineNodes: number;
  storageUsedTB: number;
  storageTotalTB: number;
  clusterHealth: 'green' | 'yellow' | 'red';
  throughputHistory: ThroughputDataPoint[];
  diskUsageDistribution: { range: string; count: number }[];
}

export type EventSeverity = 'info' | 'warning' | 'error';
export type EventType =
  | 'node_joined'
  | 'node_failure'
  | 'disk_capacity_warning'
  | 'storage_pool_expanded';

export interface ClusterEvent {
  id: string;
  timestamp: string;
  type: EventType;
  severity: EventSeverity;
  message: string;
  nodeId?: string;
}

export interface StorageTarget {
  id: string;
  path: string;
  capacityTB: number;
  enabled: boolean;
}

export interface ClusterConfig {
  replicationFactor: number;
  metadataServers: string[];
  maintenanceMode: boolean;
  storageTargets: StorageTarget[];
}

export type JobType = 'rebalance' | 'pool_expansion' | 'health_check';
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Job {
  id: string;
  type: JobType;
  name: string;
  status: JobStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export type AlertSeverity = 'info' | 'warning' | 'error' | 'success';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
}

export interface WsMessage<T = unknown> {
  event: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
