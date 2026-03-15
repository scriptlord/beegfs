/**
 * WebSocket Load Test
 *
 * Opens many simultaneous WebSocket connections and measures
 * how well the server handles broadcasting to all of them.
 *
 * Usage: node tests/load-test-websocket.mjs [num_clients] [duration_seconds]
 * Example: node tests/load-test-websocket.mjs 200 15
 */

import WebSocket from 'ws';

const WS_URL = 'ws://localhost:3001';
const NUM_CLIENTS = Number(process.argv[2]) || 100;
const DURATION_SEC = Number(process.argv[3]) || 15;

const stats = {
  connected: 0,
  disconnected: 0,
  messagesReceived: 0,
  errors: 0,
  messagesByType: {},
  latencies: [],
};

const clients = [];

function connectClient(index) {
  return new Promise((resolve) => {
    const ws = new WebSocket(WS_URL);

    ws.on('open', () => {
      stats.connected++;
      resolve(ws);
    });

    ws.on('message', (raw) => {
      stats.messagesReceived++;
      try {
        const msg = JSON.parse(raw.toString());
        stats.messagesByType[msg.event] = (stats.messagesByType[msg.event] || 0) + 1;
      } catch {}
    });

    ws.on('error', () => {
      stats.errors++;
      resolve(null);
    });

    ws.on('close', () => {
      stats.disconnected++;
    });

    clients.push(ws);
  });
}

console.log(`\n🔌 WebSocket Load Test`);
console.log(`   Clients: ${NUM_CLIENTS}`);
console.log(`   Duration: ${DURATION_SEC} seconds`);
console.log(`   Connecting...\n`);

const startTime = Date.now();

// Connect all clients
const connectStart = Date.now();
await Promise.all(Array.from({ length: NUM_CLIENTS }, (_, i) => connectClient(i)));
const connectTime = Date.now() - connectStart;

console.log(`   ✅ ${stats.connected} clients connected in ${connectTime}ms`);
if (stats.errors > 0) console.log(`   ❌ ${stats.errors} connection errors`);

console.log(`   Listening for broadcasts...\n`);

// Progress updates
const progressInterval = setInterval(() => {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const mps = (stats.messagesReceived / ((Date.now() - startTime) / 1000)).toFixed(0);
  process.stdout.write(`\r   ⏱  ${elapsed}s | ${stats.messagesReceived.toLocaleString()} messages received | ${mps} msg/s`);
}, 500);

// Stop after duration
setTimeout(() => {
  clearInterval(progressInterval);

  // Close all connections
  clients.forEach((ws) => { if (ws) ws.close(); });

  const elapsed = (Date.now() - startTime) / 1000;
  const mps = stats.messagesReceived / elapsed;

  console.log(`\n\n📊 Results`);
  console.log(`   ─────────────────────────────────────`);
  console.log(`   Connected clients:     ${stats.connected}`);
  console.log(`   Connection time:       ${connectTime}ms`);
  console.log(`   Total messages:        ${stats.messagesReceived.toLocaleString()}`);
  console.log(`   Messages/sec:          ${mps.toFixed(0)}`);
  console.log(`   Messages/client:       ${(stats.messagesReceived / stats.connected).toFixed(0)}`);
  console.log(`   Duration:              ${elapsed.toFixed(1)}s`);
  console.log(`   Errors:                ${stats.errors}`);
  console.log(`   ─────────────────────────────────────`);
  console.log(`   Messages by type:`);
  for (const [type, count] of Object.entries(stats.messagesByType)) {
    console.log(`     ${type}: ${count.toLocaleString()}`);
  }
  console.log(`   ─────────────────────────────────────\n`);

  process.exit(0);
}, DURATION_SEC * 1000);
