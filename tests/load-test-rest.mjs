/**
 * REST API Load Test
 *
 * Fires many concurrent HTTP requests at the API endpoints
 * and measures response times and throughput.
 *
 * Usage: node tests/load-test-rest.mjs [concurrency] [duration_seconds]
 * Example: node tests/load-test-rest.mjs 100 10
 */

const BASE_URL = 'http://localhost:3001/api';
const CONCURRENCY = Number(process.argv[2]) || 50;
const DURATION_SEC = Number(process.argv[3]) || 10;

const endpoints = [
  { name: 'GET /api/cluster', url: `${BASE_URL}/cluster` },
  { name: 'GET /api/nodes?pageSize=25', url: `${BASE_URL}/nodes?pageSize=25` },
  { name: 'GET /api/events', url: `${BASE_URL}/events` },
  { name: 'GET /api/config', url: `${BASE_URL}/config` },
  { name: 'GET /api/jobs', url: `${BASE_URL}/jobs` },
];

const stats = {
  total: 0,
  success: 0,
  errors: 0,
  latencies: [],
};

let running = true;

async function makeRequest() {
  while (running) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const start = performance.now();
    try {
      const res = await fetch(endpoint.url);
      if (res.ok) {
        await res.json();
        stats.success++;
      } else {
        stats.errors++;
      }
    } catch {
      stats.errors++;
    }
    const latency = performance.now() - start;
    stats.latencies.push(latency);
    stats.total++;
  }
}

console.log(`\n🔥 REST API Load Test`);
console.log(`   Concurrency: ${CONCURRENCY} workers`);
console.log(`   Duration: ${DURATION_SEC} seconds`);
console.log(`   Endpoints: ${endpoints.length}`);
console.log(`   Starting...\n`);

const startTime = Date.now();

// Launch concurrent workers
const workers = Array.from({ length: CONCURRENCY }, () => makeRequest());

// Progress updates
const progressInterval = setInterval(() => {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const rps = (stats.total / (Date.now() - startTime) * 1000).toFixed(0);
  process.stdout.write(`\r   ⏱  ${elapsed}s | ${stats.total.toLocaleString()} requests | ${rps} req/s | ${stats.errors} errors`);
}, 500);

// Stop after duration
setTimeout(() => {
  running = false;
  clearInterval(progressInterval);

  Promise.all(workers).then(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const sorted = stats.latencies.sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;

    console.log(`\n\n📊 Results`);
    console.log(`   ─────────────────────────────────────`);
    console.log(`   Total requests:    ${stats.total.toLocaleString()}`);
    console.log(`   Successful:        ${stats.success.toLocaleString()}`);
    console.log(`   Errors:            ${stats.errors}`);
    console.log(`   Duration:          ${elapsed.toFixed(1)}s`);
    console.log(`   Requests/sec:      ${(stats.total / elapsed).toFixed(0)}`);
    console.log(`   ─────────────────────────────────────`);
    console.log(`   Latency (avg):     ${avg.toFixed(1)}ms`);
    console.log(`   Latency (p50):     ${p50.toFixed(1)}ms`);
    console.log(`   Latency (p95):     ${p95.toFixed(1)}ms`);
    console.log(`   Latency (p99):     ${p99.toFixed(1)}ms`);
    console.log(`   ─────────────────────────────────────\n`);
  });
}, DURATION_SEC * 1000);
