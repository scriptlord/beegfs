import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ClusterConfig } from '../types';
import ConfigPanel from '../components/ConfigPanel';

export default function Settings() {
  const [config, setConfig] = useState<ClusterConfig | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getConfig().then(setConfig);
  }, []);

  async function handleSave(partial: Partial<ClusterConfig>) {
    const updated = await api.updateConfig(partial);
    setConfig(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!config) return <div style={{ color: 'var(--color-text-muted)' }}>Loading...</div>;

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Configuration</h2>
      {saved && (
        <div style={{
          background: 'var(--color-success)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: 6,
          marginBottom: 16,
          fontSize: 14,
        }}>
          Configuration saved successfully.
        </div>
      )}
      <ConfigPanel config={config} onSave={handleSave} />
    </div>
  );
}
