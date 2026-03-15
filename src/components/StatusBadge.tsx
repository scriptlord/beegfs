import type { NodeStatus } from '../types';

const statusColors: Record<NodeStatus, string> = {
  healthy: 'var(--color-healthy)',
  degraded: 'var(--color-degraded)',
  offline: 'var(--color-offline)',
};

export default function StatusBadge({ status }: { status: NodeStatus }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        color: '#fff',
        background: statusColors[status],
      }}
    >
      {status}
    </span>
  );
}
