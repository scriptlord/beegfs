import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
import { setupWebSocket, broadcast } from './ws/handler.js';
import { startSimulation } from './simulation.js';
import clusterRouter from './routes/cluster.js';
import nodesRouter from './routes/nodes.js';
import eventsRouter from './routes/events.js';
import configRouter from './routes/config.js';
import jobsRouter from './routes/jobs.js';
import scaleRouter from './routes/scale.js';

const app = express();
const server = createServer(app);

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.use('/api/cluster', clusterRouter);
app.use('/api/nodes', nodesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/config', configRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/scale', scaleRouter);
app.get('/api/docs', (_req, res) => {
  res.sendFile(resolve(__dirname, '..', 'openapi.yaml'));
});

setupWebSocket(server);
startSimulation(broadcast);

const PORT = Number(process.env.PORT) || 3001;
server.listen(PORT, () => {
  console.log(`BeeGFS API server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready on ws://localhost:${PORT}`);
});
