import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { ThroughputDataPoint } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Props {
  data: ThroughputDataPoint[];
}

export default function ThroughputChart({ data }: Props) {
  const labels = data.map((d) => {
    const date = new Date(d.timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Read (MB/s)',
        data: data.map((d) => d.readMBps),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: 'Write (MB/s)',
        data: data.map((d) => d.writeMBps),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 } as const,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        labels: { color: '#8892a4' },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 17, 23, 0.95)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          title: (items: any[]) => `Time: ${items[0]?.label || ''}`,
          label: (item: any) => {
            const value = item.raw as number;
            return `${item.dataset.label}: ${value.toLocaleString()} MB/s`;
          },
          afterBody: (items: any[]) => {
            if (items.length >= 2) {
              const read = items[0]?.raw as number;
              const write = items[1]?.raw as number;
              return `Total: ${(read + write).toLocaleString()} MB/s`;
            }
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Time', color: '#8892a4', font: { size: 12 } },
        ticks: { color: '#8892a4', maxTicksLimit: 10 },
        grid: { color: 'rgba(42, 46, 58, 0.5)' },
      },
      y: {
        title: { display: true, text: 'Speed (MB/s)', color: '#8892a4', font: { size: 12 } },
        ticks: { color: '#8892a4' },
        grid: { color: 'rgba(42, 46, 58, 0.5)' },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 20, height: 320 }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
