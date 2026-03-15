import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import type { ClusterSummary } from '../types';
import SummaryCard from '../components/SummaryCard';
import ThroughputChart from '../components/ThroughputChart';
import NodeHealthChart from '../components/NodeHealthChart';
import StorageDistributionChart from '../components/StorageDistributionChart';

export default function Dashboard() {
  const [summary, setSummary] = useState<ClusterSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getCluster()
      .then((data) => { setSummary(data); setError(null); })
      .catch(() => setError('Failed to load cluster data'));

    const unsub = wsService.subscribe('cluster:update', (data: ClusterSummary) => {
      setSummary(data);
      setError(null);
    });

    return unsub;
  }, []);

  if (error) {
    return (
      <div style={{ color: 'var(--color-offline)', textAlign: 'center', padding: 40 }}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: 12, background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!summary) return <div style={{ color: 'var(--color-text-muted)' }}>Loading...</div>;

  const healthVariant = summary.clusterHealth === 'green' ? 'success'
    : summary.clusterHealth === 'yellow' ? 'warning' : 'danger';

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Cluster Overview</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <SummaryCard title="Total Nodes" value={summary.totalNodes} />
        <SummaryCard
          title="Active Nodes"
          value={summary.activeNodes}
          subtitle={`${summary.offlineNodes} offline`}
          variant="success"
        />
        <SummaryCard
          title="Storage Usage"
          value={`${summary.storageUsedTB} TB`}
          subtitle={`of ${summary.storageTotalTB} TB`}
        />
        <SummaryCard
          title="Cluster Health"
          value={summary.clusterHealth.toUpperCase()}
          variant={healthVariant}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <NodeHealthChart
          healthy={summary.healthyNodes}
          degraded={summary.degradedNodes}
          offline={summary.offlineNodes}
        />
        <StorageDistributionChart distribution={summary.diskUsageDistribution} activeNodes={summary.activeNodes} />
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>IO Throughput</h3>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
        Combined read/write speed across all {summary.activeNodes.toLocaleString()} active nodes
      </p>
      <ThroughputChart data={summary.throughputHistory} />
    </div>
  );
}
