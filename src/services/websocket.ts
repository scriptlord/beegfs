import type { WsMessage } from '../types';

type Listener = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private url: string;
  private _connected = false;
  private connectionListeners = new Set<(connected: boolean) => void>();

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this._connected = true;
      this.notifyConnectionListeners();
    };

    this.ws.onmessage = (e) => {
      try {
        const msg: WsMessage = JSON.parse(e.data);
        const handlers = this.listeners.get(msg.event);
        if (handlers) handlers.forEach((fn) => fn(msg.data));
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      this._connected = false;
      this.notifyConnectionListeners();
      this.reconnectTimer = setTimeout(() => this.connect(), 2000);
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.ws?.close();
    this.ws = null;
  }

  subscribe(event: string, listener: Listener): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  send(event: string, data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  get isConnected() {
    return this._connected;
  }

  onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  private notifyConnectionListeners() {
    this.connectionListeners.forEach((fn) => fn(this._connected));
  }
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
export const wsService = new WebSocketService(WS_URL);
