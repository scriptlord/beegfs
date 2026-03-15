import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  healthy: number;
  degraded: number;
  offline: number;
}

export default function NodeHealthChart({ healthy, degraded, offline }: Props) {
  const data = {
    labels: ['Healthy', 'Degraded', 'Offline'],
    datasets: [
      {
        data: [healthy, degraded, offline],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderColor: 'transparent',
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 } as const,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--color-text)' }}>Node Health</div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ width: 180, height: 180, flexShrink: 0 }}>
          <Doughnut data={data} options={options} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{healthy.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Healthy — responding normally, serving files</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{degraded.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Degraded — responding slowly, possible disk or network issues</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>{offline.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Offline — not responding, needs attention</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
