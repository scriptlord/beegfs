import { createContext, useState, useCallback, useEffect, useRef } from 'react';
import type { AlertSeverity } from '../types';
import { wsService } from '../services/websocket';
import styles from './AlertProvider.module.css';

interface AlertItem {
  id: string;
  severity: AlertSeverity;
  message: string;
}

interface AlertContextType {
  addAlert: (severity: AlertSeverity, message: string) => void;
}

export const AlertContext = createContext<AlertContextType>({
  addAlert: () => {},
});

export default function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const recentMessages = useRef(new Set<string>());

  const addAlert = useCallback((severity: AlertSeverity, message: string) => {
    // Deduplicate alerts within 1 second window (prevents StrictMode double-fire)
    const key = `${severity}:${message}`;
    if (recentMessages.current.has(key)) return;
    recentMessages.current.add(key);
    setTimeout(() => recentMessages.current.delete(key), 1000);

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setAlerts((prev) => [...prev.slice(-2), { id, severity, message }]);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    const unsub = wsService.subscribe('alert:new', (data: { severity: AlertSeverity; message: string }) => {
      addAlert(data.severity, data.message);
    });
    return unsub;
  }, [addAlert]);

  const dismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AlertContext.Provider value={{ addAlert }}>
      {children}
      <div className={styles.container}>
        {alerts.map((alert) => (
          <div key={alert.id} className={`${styles.toast} ${styles[alert.severity]}`}>
            <span className={styles.message}>{alert.message}</span>
            <button className={styles.close} onClick={() => dismiss(alert.id)}>x</button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}
