# Contributing to BeeGFS Cluster Management UI

Thanks for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
git clone https://github.com/scriptlord/beegfs.git
cd beegfs
npm install
npm run dev
```

This starts both the Express server (`:3001`) and Vite client (`:5173`).

## Project Structure

```
shared/types.ts          → Shared TypeScript interfaces (modify types here)
server/                  → Express + WebSocket backend
  routes/                → REST API endpoints
  simulation.ts          → Real-time data simulation
  ws/handler.ts          → WebSocket broadcast logic
src/                     → React frontend
  components/            → Reusable UI components
  pages/                 → Route-level page components
  services/api.ts        → Typed API client (auto-generated from OpenAPI)
  services/websocket.ts  → WebSocket client with auto-reconnect
openapi.yaml             → API specification (source of truth for types)
```

## How to Add a New Page

1. Create `src/pages/YourPage.tsx`
2. Add the route in `src/App.tsx`
3. Add the nav link in `src/components/Layout.tsx`

## How to Add a New API Endpoint

1. Add the route in `server/routes/` (follow existing patterns)
2. Register it in `server/index.ts`
3. Add the endpoint to `openapi.yaml`
4. Run `npm run generate:api` to regenerate TypeScript types
5. Use the typed client in `src/services/api.ts`

## How to Add a New WebSocket Event

1. Broadcast the event in `server/simulation.ts` or `server/ws/handler.ts`
2. Subscribe to it in the relevant page component using `wsService.subscribe()`

## Code Conventions

- **TypeScript** — No `any` types. Use interfaces from `shared/types.ts`
- **CSS Modules** — One `.module.css` file per component
- **Dark theme** — Use CSS variables from `src/index.css` (e.g., `var(--color-surface)`)
- **Destructive operations** — Must use `ConfirmDialog` for user confirmation
- **API changes** — Update `openapi.yaml` first, then regenerate types

## Running Tests

```bash
npm test              # Run all tests
npm run test:rest     # Load test REST API
npm run test:ws       # Load test WebSocket
```

## Submitting Changes

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run `npx tsc --noEmit` to type-check
5. Run `npm run build` to verify production build
6. Commit with a clear message
7. Open a Pull Request

## Questions?

Open an issue on GitHub.
