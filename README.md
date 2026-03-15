# BeeGFS Cluster Management UI

A full-stack admin dashboard for monitoring and managing a BeeGFS-inspired distributed storage cluster. Built to demonstrate frontend architecture for infrastructure systems, real-time data visualization, and safe admin workflows at scale.

![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Express](https://img.shields.io/badge/Express-5-000)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-green)
![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-6ba539)

### Live Demo

- **Dashboard:** [beegfs.vercel.app](https://beegfs.vercel.app)
- **API:** [beegfs.onrender.com/api/cluster](https://beegfs.onrender.com/api/cluster)
- **API Spec:** [beegfs.onrender.com/api/docs](https://beegfs.onrender.com/api/docs)
- **Source:** [github.com/scriptlord/beegfs](https://github.com/scriptlord/beegfs)

> Note: The backend runs on Render's free tier and may take 30-60 seconds to cold-start after inactivity. If the dashboard shows "Disconnected," wait a moment and it will auto-reconnect.

---

## What Is This?

A **prototype control panel** for a distributed storage cluster — a group of computers that work together to store massive amounts of files. BeeGFS is a real parallel file system used by companies handling AI training data, genomics, movie rendering, and scientific research.

This dashboard lets administrators:
- **Monitor** cluster health, node statuses, storage usage, and IO throughput in real-time
- **Manage** background jobs (data rebalancing, health checks)
- **Configure** replication, metadata servers, maintenance mode
- **Scale** from 1,000 to 1,000,000,000 nodes with a button click

---

## Architecture

```
┌──────────────────────────────────────────────┐
│            SERVER (Express :3001)             │
│                                              │
│  store.ts ◄── simulation.ts (every 3s)       │
│     │                                        │
│  REST API              WebSocket             │
│  (request/response)    (server pushes)        │
│                                              │
│  GET  /api/cluster     cluster:update         │
│  GET  /api/nodes       node:update            │
│  GET  /api/events      event:new              │
│  GET  /api/config      job:update             │
│  POST /api/config      alert:new              │
│  GET  /api/jobs                               │
│  POST /api/jobs                               │
│  DEL  /api/jobs/:id                           │
│  GET  /api/scale                              │
│  POST /api/scale                              │
│  GET  /api/docs                               │
└──────────┬──────────────┬────────────────────┘
       HTTP/REST      WebSocket
           │              │
┌──────────┴──────────────┴────────────────────┐
│          FRONTEND (React + Vite :5173)        │
│                                              │
│  Dashboard │ Nodes │ Events │ Jobs │ Settings │
│                                              │
│  REST for initial load                        │
│  WebSocket for live updates                   │
│  No page refresh needed                       │
└──────────────────────────────────────────────┘
```

**Data Flow:** Every 3 seconds, the server simulation changes node statuses, generates events, and advances jobs. Changes are pushed instantly to all connected dashboards via WebSocket. Pages load initial data via REST, then subscribe to WebSocket events for live updates.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework with hooks |
| **TypeScript** | Type safety across the entire codebase |
| **Vite** | Dev server and production build |
| **TanStack Table** | Data table with sorting, filtering, pagination |
| **TanStack Virtual** | Virtual scrolling for 1M+ row tables |
| **Chart.js + react-chartjs-2** | Doughnut, bar, and line charts |
| **React Router v6** | Client-side routing with layout routes |
| **CSS Modules** | Scoped component styling |
| **openapi-fetch** | Type-safe API client generated from OpenAPI spec |

### Backend
| Technology | Purpose |
|---|---|
| **Express 5** | REST API server |
| **ws** | WebSocket server for real-time push |
| **TypeScript** | Shared types between server and client |
| **tsx** | Run TypeScript directly without build step |

### Tooling
| Tool | Purpose |
|---|---|
| **openapi-typescript** | Generate TS types from OpenAPI spec |
| **concurrently** | Run server + client in one command |
| **OpenAPI 3.1** | API specification (`openapi.yaml`) |

---

## Pages

### Dashboard
The cluster overview showing 4 summary cards (Total Nodes, Active Nodes, Storage Usage, Cluster Health), a Node Health doughnut chart, a Disk Usage Distribution bar chart, and an IO Throughput line chart. All update in real-time via WebSocket.

### Storage Nodes
A data table showing every computer in the cluster with columns: Node ID, Hostname, Status (colored badge), Disk Usage (progress bar), IO Throughput, and Last Heartbeat. Features:
- **Scale Selector** — Switch between 1K, 10K, 100K, 1M, and 1B nodes
- **Paginated view** — Server-side pagination (25/50/100 per page)
- **Virtual Scroll view** — Infinite scrolling with on-demand loading (200 nodes per batch)
- **Search** — Filter by node ID or hostname
- **Sorting** — Click any column header

### Events
A live feed of cluster events (node joined, node failure, disk capacity warning, storage pool expanded). Features a pulsing green "Live" indicator, severity filters (All/Info/Warning/Error), and new events glow blue when they arrive via WebSocket.

### Jobs
Background operations management. Create jobs (Data Rebalance, Pool Expansion, Health Check), watch animated progress bars fill in real-time, and cancel running jobs with confirmation dialogs. Job progress and completion/failure notifications are pushed via WebSocket.

### Settings
Cluster configuration form with:
- **Replication Factor** — How many backup copies of each file (1-4)
- **Metadata Servers** — Add/remove servers that track file locations
- **Maintenance Mode** — Toggle to pause operations during maintenance
- **Storage Targets** — Enable/disable individual storage drives

All destructive actions (removing servers, enabling maintenance, disabling drives) require confirmation dialogs.

### Architecture
An in-app page explaining how the entire system works in plain English — the two parts (server/dashboard), how they communicate (REST vs WebSocket), the data flow, what each page shows, safety features, and how scale works.

---

## Real-Time Features

| Feature | Mechanism |
|---|---|
| Dashboard charts update | WebSocket `cluster:update` every 3s |
| Node status badges flip color | WebSocket `node:update` per changed node |
| New events appear with glow | WebSocket `event:new` per event |
| Job progress bars animate | WebSocket `job:update` per tick |
| Toast alerts pop up | WebSocket `alert:new` for critical events |
| Disconnection banner | WebSocket `onclose` + auto-reconnect every 2s |
| Slow connection banner | REST response time > 2s detection |

### Alert Types
| Alert | Severity | Diagnostic Hint |
|---|---|---|
| Node went offline | Error | check: power, network, service status |
| Node is degraded | Warning | check: disk I/O errors, network latency, memory usage |
| Node back online | Success | — |
| Disk usage > 90% | Warning | check: cleanup old files, expand storage |
| Job completed | Success | — |
| Job failed | Error | check: server logs, retry the job |

---

## Scale

The system handles clusters from 1,000 to 1,000,000,000 nodes:

| Technique | How It Works |
|---|---|
| **Scale Selector** | Click 1K / 10K / 100K / 1M / 1B buttons — server regenerates data instantly, no restart |
| **Server-Side Pagination** | Server sends one page at a time (25-100 nodes). Even with 1B nodes, each request is fast |
| **Virtual Scrolling** | Only visible table rows are rendered in the DOM. Scroll smoothly through any number of rows |
| **Infinite Scroll** | In Virtual Scroll mode, the next batch loads automatically as you scroll near the bottom |
| **On-The-Fly Generation** | For 1M+ nodes, nodes are generated deterministically per page request — no memory bloat |

### Load Test Results
| Metric | Result |
|---|---|
| REST API throughput | 16,000+ requests/sec |
| REST API latency (p50) | 3ms |
| WebSocket clients | 200+ simultaneous |
| WebSocket messages | 11,000 delivered in 15s |
| Max nodes supported | 1,000,000,000 |

Run load tests yourself:
```bash
npm run test:rest          # 50 concurrent, 10 seconds
npm run test:ws            # 200 WebSocket clients, 15 seconds
npm run test:rest:heavy    # 200 concurrent, 30 seconds
npm run test:ws:heavy      # 500 WebSocket clients, 30 seconds
```

---

## Network Resilience

| Feature | Implementation |
|---|---|
| **Request Timeout** | All API calls abort after 5 seconds via `AbortController` |
| **Retry with Backoff** | Failed requests retry 3 times (1s → 2s → 4s delays) |
| **Slow Connection Banner** | Yellow banner appears if responses take > 2 seconds |
| **Disconnection Banner** | Red banner when WebSocket drops, stays 5s after reconnecting |
| **Auto-Reconnect** | WebSocket reconnects every 2 seconds after disconnect |

---

## Safety Features

- **Confirmation Dialogs** — Destructive actions (removing a metadata server, enabling maintenance mode, disabling a storage target, cancelling a job) show "Are you sure?" confirmation
- **Unsaved Changes Warning** — Settings page shows "You have unsaved changes" if you modify values without saving
- **Error Boundary** — Catches React crashes and shows a friendly error screen with Reload button
- **Toast Deduplication** — Same alert can't appear twice within 1 second (prevents React StrictMode double-fire)
- **Max 3 Toasts** — Alert stack capped at 3 to prevent screen clutter

---

## API Specification

The API is documented with an **OpenAPI 3.1** specification:

- **File:** `openapi.yaml` in the project root
- **Live endpoint:** `GET /api/docs` serves the spec from the running server
- **Type generation:** `npm run generate:api` generates TypeScript types from the spec
- **Postman:** Import `openapi.yaml` directly into Postman for a ready-to-use collection

The frontend uses `openapi-fetch` with generated types — every API call is fully type-checked at compile time.

---

## Project Structure

```
beegfs/
├── shared/
│   └── types.ts                 # Shared TypeScript interfaces (server + client)
├── server/
│   ├── index.ts                 # Express + WebSocket entry point
│   ├── store.ts                 # In-memory data store
│   ├── generators.ts            # Mock data generators
│   ├── simulation.ts            # Real-time simulation (runs every 3s)
│   ├── routes/
│   │   ├── cluster.ts           # GET /api/cluster
│   │   ├── nodes.ts             # GET /api/nodes (paginated, virtual mode)
│   │   ├── events.ts            # GET /api/events
│   │   ├── config.ts            # GET/POST /api/config
│   │   ├── jobs.ts              # GET/POST/DELETE /api/jobs
│   │   └── scale.ts             # GET/POST /api/scale
│   └── ws/
│       └── handler.ts           # WebSocket connection manager + broadcast
├── src/
│   ├── services/
│   │   ├── api.ts               # Type-safe API client (openapi-fetch) with retry/timeout
│   │   ├── api-types.d.ts       # Auto-generated from openapi.yaml
│   │   └── websocket.ts         # WebSocket client with auto-reconnect
│   ├── hooks/
│   │   ├── useWebSocket.ts      # WebSocket connection hook
│   │   └── useAlert.ts          # Alert context hook
│   ├── components/
│   │   ├── Layout.tsx            # Sidebar navigation + page container
│   │   ├── SummaryCard.tsx       # Metric card
│   │   ├── ThroughputChart.tsx   # IO throughput line chart
│   │   ├── NodeHealthChart.tsx   # Node health doughnut chart
│   │   ├── StorageDistributionChart.tsx  # Disk usage bar chart
│   │   ├── NodeTable.tsx         # Data table (paginated + virtual scroll)
│   │   ├── StatusBadge.tsx       # Colored status pill
│   │   ├── EventLog.tsx          # Live event feed
│   │   ├── JobTracker.tsx        # Job list with progress bars
│   │   ├── ConfigPanel.tsx       # Settings form
│   │   ├── ConfirmDialog.tsx     # Confirmation modal
│   │   ├── AlertProvider.tsx     # Toast notification system
│   │   ├── ScaleSelector.tsx     # 1K/10K/100K/1M/1B switcher
│   │   └── ErrorBoundary.tsx     # Crash recovery
│   ├── pages/
│   │   ├── Dashboard.tsx         # Cluster overview
│   │   ├── Nodes.tsx             # Storage nodes table
│   │   ├── Events.tsx            # Event log
│   │   ├── Jobs.tsx              # Job management
│   │   ├── Settings.tsx          # Configuration
│   │   └── Architecture.tsx      # System explainer page
│   ├── types/
│   │   └── index.ts             # Re-exports from shared/types.ts
│   ├── App.tsx                  # Router + WebSocket + AlertProvider + ErrorBoundary
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global dark theme CSS variables
├── tests/
│   ├── load-test-rest.mjs       # REST API load test
│   └── load-test-websocket.mjs  # WebSocket load test
├── openapi.yaml                 # OpenAPI 3.1 specification
├── tsconfig.json                # Frontend TypeScript config
├── tsconfig.server.json         # Server TypeScript config
├── vite.config.ts               # Vite config
└── package.json                 # Dependencies and scripts
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install
```bash
git clone https://github.com/YOUR_USERNAME/beegfs-ui.git
cd beegfs-ui
npm install
```

### Run (Development)
```bash
npm run dev
```
This starts both the Express server (`:3001`) and Vite client (`:5173`) concurrently.

Open **http://localhost:5173** in your browser.

### All Commands
| Command | Description |
|---|---|
| `npm run dev` | Start server + client (development) |
| `npm run dev:client` | Start only the frontend |
| `npm run dev:server` | Start only the backend |
| `npm run build` | Type-check + production build |
| `npm run generate:api` | Regenerate TypeScript types from OpenAPI spec |
| `npm run test:rest` | Load test REST API (50 concurrent, 10s) |
| `npm run test:ws` | Load test WebSocket (200 clients, 15s) |
| `npm run test:rest:heavy` | Heavy REST load test (200 concurrent, 30s) |
| `npm run test:ws:heavy` | Heavy WebSocket load test (500 clients, 30s) |

---

## Deployment

### Frontend → Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Framework: Vite (auto-detected)
3. Environment variables:
   - `VITE_API_URL` = `https://your-render-app.onrender.com/api`
   - `VITE_WS_URL` = `wss://your-render-app.onrender.com`

### Backend → Render
1. Create Web Service on [render.com](https://render.com)
2. Connect your GitHub repo
3. Build Command: `npm install`
4. Start Command: `npx tsx server/index.ts`
5. Environment variables:
   - `CORS_ORIGIN` = `https://your-vercel-app.vercel.app`
   - `NODE_COUNT` = `1000`

---

## Environment Variables

| Variable | Where | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Frontend | `http://localhost:3001/api` | REST API base URL |
| `VITE_WS_URL` | Frontend | `ws://localhost:3001` | WebSocket server URL |
| `PORT` | Backend | `3001` | Server port (Render sets this) |
| `CORS_ORIGIN` | Backend | `http://localhost:5173` | Allowed frontend origin |
| `NODE_COUNT` | Backend | `1000` | Initial number of simulated nodes |

---

## What This Demonstrates

This project was built to demonstrate proficiency in the skills required for building admin interfaces for distributed systems:

| Skill | How It's Demonstrated |
|---|---|
| Design usable interfaces for complex technical systems | 12 custom components, dark theme, charts, tables — no UI library |
| TypeScript + modern frontend framework | Full TypeScript across client, server, and shared types |
| SPAs interacting with backend APIs (REST/JSON) | Real Express REST API + React Router SPA |
| API specifications and generated clients | OpenAPI 3.1 spec + auto-generated typed client via openapi-fetch |
| Correctness, edge cases, failure modes | ErrorBoundary, retry with backoff, timeouts, disconnect banner, confirmation dialogs |
| Real-time updates | WebSocket push for 5 event types, no polling |
| Scale | 1B nodes, virtual scrolling, server-side pagination, 16K req/s |
| Safe admin workflows | Confirmation dialogs for destructive ops, unsaved changes warning |

---

## License

MIT
