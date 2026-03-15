import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/StatusBadge';
import SummaryCard from '../components/SummaryCard';
import ErrorBoundary from '../components/ErrorBoundary';

describe('StatusBadge', () => {
  it('renders healthy status', () => {
    render(<StatusBadge status="healthy" />);
    expect(screen.getByText('healthy')).toBeInTheDocument();
  });

  it('renders degraded status', () => {
    render(<StatusBadge status="degraded" />);
    expect(screen.getByText('degraded')).toBeInTheDocument();
  });

  it('renders offline status', () => {
    render(<StatusBadge status="offline" />);
    expect(screen.getByText('offline')).toBeInTheDocument();
  });

  it('applies correct color for healthy', () => {
    render(<StatusBadge status="healthy" />);
    const badge = screen.getByText('healthy');
    expect(badge).toHaveStyle({ background: 'var(--color-healthy)' });
  });

  it('applies correct color for offline', () => {
    render(<StatusBadge status="offline" />);
    const badge = screen.getByText('offline');
    expect(badge).toHaveStyle({ background: 'var(--color-offline)' });
  });
});

describe('SummaryCard', () => {
  it('renders title and value', () => {
    render(<SummaryCard title="Total Nodes" value={1000} />);
    expect(screen.getByText('Total Nodes')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<SummaryCard title="Active" value={970} subtitle="30 offline" />);
    expect(screen.getByText('30 offline')).toBeInTheDocument();
  });

  it('renders without subtitle', () => {
    render(<SummaryCard title="Health" value="GREEN" />);
    expect(screen.getByText('GREEN')).toBeInTheDocument();
  });
});

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders error screen when child throws', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Reload')).toBeInTheDocument();

    spy.mockRestore();
  });
});
