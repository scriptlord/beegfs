import { useEffect, useState } from 'react';
import { wsService } from '../services/websocket';

export function useWebSocket() {
  const [connected, setConnected] = useState(wsService.isConnected);

  useEffect(() => {
    wsService.connect();
    const unsub = wsService.onConnectionChange(setConnected);
    return () => {
      unsub();
    };
  }, []);

  return { connected };
}
