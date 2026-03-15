import { useState } from 'react';
import type { ClusterConfig } from '../types';
import ConfirmDialog from './ConfirmDialog';
import styles from './ConfigPanel.module.css';

interface Props {
  config: ClusterConfig;
  onSave: (updated: Partial<ClusterConfig>) => void;
}

export default function ConfigPanel({ config, onSave }: Props) {
  const [replicationFactor, setReplicationFactor] = useState(config.replicationFactor);
  const [metadataServers, setMetadataServers] = useState([...config.metadataServers]);
  const [maintenanceMode, setMaintenanceMode] = useState(config.maintenanceMode);
  const [storageTargets, setStorageTargets] = useState([...config.storageTargets]);
  const [newServer, setNewServer] = useState('');
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    action: () => void;
    variant: 'danger' | 'warning';
  } | null>(null);

  function handleRemoveServer(idx: number) {
    const server = metadataServers[idx];
    setConfirm({
      title: 'Remove Metadata Server',
      message: `Are you sure you want to remove "${server}"? This may affect cluster metadata availability.`,
      variant: 'danger',
      action: () => {
        setMetadataServers((s) => s.filter((_, i) => i !== idx));
        setConfirm(null);
      },
    });
  }

  function handleAddServer() {
    if (newServer.trim()) {
      setMetadataServers((s) => [...s, newServer.trim()]);
      setNewServer('');
    }
  }

  function handleToggleMaintenance() {
    if (!maintenanceMode) {
      setConfirm({
        title: 'Enable Maintenance Mode',
        message: 'Enabling maintenance mode will pause all non-critical IO operations. Are you sure?',
        variant: 'warning',
        action: () => {
          setMaintenanceMode(true);
          setConfirm(null);
        },
      });
    } else {
      setMaintenanceMode(false);
    }
  }

  function handleToggleTarget(id: string) {
    const target = storageTargets.find((t) => t.id === id);
    if (!target) return;

    if (target.enabled) {
      setConfirm({
        title: 'Disable Storage Target',
        message: `Disabling "${target.path}" will stop all IO to this target. Proceed?`,
        variant: 'danger',
        action: () => {
          setStorageTargets((ts) => ts.map((t) => (t.id === id ? { ...t, enabled: false } : t)));
          setConfirm(null);
        },
      });
    } else {
      setStorageTargets((ts) => ts.map((t) => (t.id === id ? { ...t, enabled: true } : t)));
    }
  }

  const hasChanges =
    replicationFactor !== config.replicationFactor ||
    maintenanceMode !== config.maintenanceMode ||
    JSON.stringify(metadataServers) !== JSON.stringify(config.metadataServers) ||
    JSON.stringify(storageTargets) !== JSON.stringify(config.storageTargets);

  function handleSave() {
    onSave({ replicationFactor, metadataServers, maintenanceMode, storageTargets });
  }

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Replication</div>
        <div className={styles.field}>
          <span className={styles.label}>Replication Factor</span>
          <input
            className={styles.input}
            type="number"
            min={1}
            max={4}
            value={replicationFactor}
            onChange={(e) => setReplicationFactor(Number(e.target.value))}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Metadata Servers</div>
        <div className={styles.serverList}>
          {metadataServers.map((server, idx) => (
            <div key={idx} className={styles.serverItem}>
              <code>{server}</code>
              <button className={styles.removeBtn} onClick={() => handleRemoveServer(idx)}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className={styles.addRow}>
          <input
            className={styles.textInput}
            placeholder="meta-server-003"
            value={newServer}
            onChange={(e) => setNewServer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddServer()}
          />
          <button className={styles.addBtn} onClick={handleAddServer}>Add</button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Maintenance</div>
        <div className={styles.field}>
          <span className={styles.label}>Maintenance Mode</span>
          <button
            className={`${styles.toggle} ${maintenanceMode ? styles.toggleOn : ''}`}
            onClick={handleToggleMaintenance}
          >
            <div className={styles.toggleKnob} />
          </button>
          <span style={{ fontSize: 14, color: maintenanceMode ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
            {maintenanceMode ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Storage Targets</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
          {storageTargets.length} targets ({storageTargets.reduce((sum, t) => sum + t.capacityTB, 0)} TB) — in a real cluster, targets would scale with the number of nodes
        </div>
        <table className={styles.targetTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Path</th>
              <th>Capacity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {storageTargets.map((target) => (
              <tr key={target.id}>
                <td><code>{target.id}</code></td>
                <td>{target.path}</td>
                <td>{target.capacityTB} TB</td>
                <td>
                  <button
                    className={`${styles.toggle} ${target.enabled ? styles.toggleOn : ''}`}
                    onClick={() => handleToggleTarget(target.id)}
                    style={{ transform: 'scale(0.85)' }}
                  >
                    <div className={styles.toggleKnob} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasChanges && (
        <div style={{ color: 'var(--color-degraded)', fontSize: 13, marginBottom: 8 }}>
          You have unsaved changes. Click Save to apply.
        </div>
      )}
      <button className={styles.saveBtn} onClick={handleSave}>Save Configuration</button>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        variant={confirm?.variant ?? 'danger'}
        onConfirm={() => confirm?.action()}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
