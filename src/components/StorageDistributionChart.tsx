import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface Props {
  distribution: { range: string; count: number }[];
  activeNodes?: number;
}

export default function StorageDistributionChart({ distribution, activeNodes }: Props) {
  const data = {
    labels: distribution.map((d) => d.range),
    datasets: [
      {
        label: 'Nodes',
        data: distribution.map((d) => d.count),
        backgroundColor: ['#3b82f6', '#6366f1', '#8b5cf6', '#f59e0b', '#ef4444'],
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 } as const,
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#94a3b8' },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--color-text)' }}>Disk Usage Distribution</div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
        Across {activeNodes?.toLocaleString() ?? '—'} active nodes (excludes offline)
      </div>
      <div style={{ height: 250 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
