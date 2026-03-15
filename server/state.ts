// Simple state module — no imports from other server files
// Breaks circular dependency between simulation.ts and routes/scale.ts

let _nodeCount = Number(process.env.NODE_COUNT) || 1000;
let _virtualMode = false;

export function getNodeCount(): number { return _nodeCount; }
export function isVirtualMode(): boolean { return _virtualMode; }
export function setNodeCount(count: number, virtual: boolean) {
  _nodeCount = count;
  _virtualMode = virtual;
}
