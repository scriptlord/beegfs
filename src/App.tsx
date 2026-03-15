import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import AlertProvider from './components/AlertProvider';
import Dashboard from './pages/Dashboard';
import Nodes from './pages/Nodes';
import Events from './pages/Events';
import Jobs from './pages/Jobs';
import Settings from './pages/Settings';
import Architecture from './pages/Architecture';
import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { onSlowConnection } from './services/api';

function AppInner() {
  const { connected } = useWebSocket();
  const [showBanner, setShowBanner] = useState(false);
  const [slowConnection, setSlowConnection] = useState(false);
  const wasDisconnected = useRef(false);

  useEffect(() => {
    if (!connected) {
      wasDisconnected.current = true;
      setShowBanner(true);
    } else if (wasDisconnected.current) {
      const timer = setTimeout(() => {
        setShowBanner(false);
        wasDisconnected.current = false;
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [connected]);

  useEffect(() => {
    onSlowConnection(setSlowConnection);
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        {showBanner && (
          <div style={{
            background: 'var(--color-offline)',
            color: '#fff',
            textAlign: 'center',
            padding: '6px 16px',
            fontSize: 13,
          }}>
            Disconnected from server. Reconnecting...
          </div>
        )}
        {slowConnection && !showBanner && (
          <div style={{
            background: 'var(--color-degraded)',
            color: '#000',
            textAlign: 'center',
            padding: '6px 16px',
            fontSize: 13,
          }}>
            Slow connection detected. Responses are taking longer than usual.
          </div>
        )}
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nodes" element={<Nodes />} />
            <Route path="/events" element={<Events />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/architecture" element={<Architecture />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AlertProvider>
      <AppInner />
    </AlertProvider>
  );
}
