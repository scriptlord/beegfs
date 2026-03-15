import createClient from 'openapi-fetch';
import type { paths } from './api-types';

const REQUEST_TIMEOUT_MS = 5000;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // exponential backoff

// Track slow responses for the UI
let _onSlowConnection: ((slow: boolean) => void) | null = null;
export function onSlowConnection(cb: (slow: boolean) => void) { _onSlowConnection = cb; }

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const client = createClient<paths>({ baseUrl: API_BASE });

async function withResilience<T>(fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const start = performance.now();

    try {
      const result = await fn(controller.signal);
      const elapsed = performance.now() - start;
      _onSlowConnection?.(elapsed > 2000);
      return result;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));

      if (controller.signal.aborted) {
        lastError = new Error('Request timed out');
      }

      // Don't retry on non-network errors (4xx)
      if (lastError.message.includes('4')) break;

      // Wait before retrying (except on last attempt)
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  _onSlowConnection?.(false);
  throw lastError!;
}

export const api = {
  getCluster: () =>
    withResilience(async (signal) => {
      const { data, error } = await client.GET('/cluster', { signal });
      if (error) throw new Error('Failed to fetch cluster data');
      return data!;
    }),

  getNodes: (params?: paths['/nodes']['get']['parameters']['query']) =>
    withResilience(async (signal) => {
      const { data, error } = await client.GET('/nodes', { params: { query: params }, signal });
      if (error) throw new Error('Failed to fetch nodes');
      return data!;
    }),

  getEvents: (severity?: string) =>
    withResilience(async (signal) => {
      const { data, error } = await client.GET('/events', {
        params: { query: severity ? { severity: severity as 'info' | 'warning' | 'error' } : {} },
        signal,
      });
      if (error) throw new Error('Failed to fetch events');
      return data!;
    }),

  getConfig: () =>
    withResilience(async (signal) => {
      const { data, error } = await client.GET('/config', { signal });
      if (error) throw new Error('Failed to fetch config');
      return data!;
    }),

  updateConfig: (body: paths['/config']['post']['requestBody']['content']['application/json']) =>
    withResilience(async (signal) => {
      const { data, error } = await client.POST('/config', { body, signal });
      if (error) throw new Error('Failed to update config');
      return data!;
    }),

  getJobs: () =>
    withResilience(async (signal) => {
      const { data, error } = await client.GET('/jobs', { signal });
      if (error) throw new Error('Failed to fetch jobs');
      return data!;
    }),

  createJob: (type: 'rebalance' | 'pool_expansion' | 'health_check') =>
    withResilience(async (signal) => {
      const { data, error } = await client.POST('/jobs', { body: { type }, signal });
      if (error) throw new Error('Failed to create job');
      return data!;
    }),

  cancelJob: (id: string) =>
    withResilience(async (signal) => {
      const { data, error } = await client.DELETE('/jobs/{id}', { params: { path: { id } }, signal });
      if (error) throw new Error('Failed to cancel job');
      return data!;
    }),
};
