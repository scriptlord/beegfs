import { generateNodes, generateThroughputHistory, generateEvents, generateConfig } from './generators.js';
import type { StorageNode, ThroughputDataPoint, ClusterEvent, ClusterConfig, Job } from '../shared/types.js';

const NODE_COUNT = Number(process.env.NODE_COUNT) || 1000;

console.log(`Generating ${NODE_COUNT.toLocaleString()} nodes...`);
const startTime = Date.now();

export const store: {
  nodes: StorageNode[];
  throughputHistory: ThroughputDataPoint[];
  events: ClusterEvent[];
  config: ClusterConfig;
  jobs: Job[];
} = {
  nodes: generateNodes(NODE_COUNT),
  throughputHistory: generateThroughputHistory(60),
  events: generateEvents(50),
  config: generateConfig(),
  jobs: [],
};

console.log(`${NODE_COUNT.toLocaleString()} nodes generated in ${Date.now() - startTime}ms`);
