import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { WsMessage, JobType } from '../../shared/types.js';
import { store } from '../store.js';
import { createJob } from '../generators.js';

let wss: WebSocketServer;
const clients = new Set<WebSocket>();

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('message', (raw) => {
      try {
        const msg: WsMessage = JSON.parse(raw.toString());
        handleClientMessage(ws, msg);
      } catch {
        // ignore malformed messages
      }
    });

    ws.on('close', () => clients.delete(ws));
  });
}

function handleClientMessage(_ws: WebSocket, msg: WsMessage) {
  switch (msg.event) {
    case 'job:create': {
      const { type } = msg.data as { type: JobType };
      const job = createJob(type);
      store.jobs.push(job);
      broadcast('job:update', job);
      break;
    }
    case 'job:cancel': {
      const { id } = msg.data as { id: string };
      const job = store.jobs.find((j) => j.id === id);
      if (job && (job.status === 'queued' || job.status === 'running')) {
        job.status = 'cancelled';
        job.updatedAt = new Date().toISOString();
        broadcast('job:update', job);
      }
      break;
    }
  }
}

export function broadcast(event: string, data: unknown) {
  const payload = JSON.stringify({ event, data });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}
