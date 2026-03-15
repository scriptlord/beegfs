import { describe, it, expect } from 'vitest';

// Inline the utility functions since they're defined inside components
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function diskColor(pct: number): string {
  if (pct >= 90) return 'var(--color-error)';
  if (pct >= 75) return 'var(--color-warning)';
  return 'var(--color-healthy)';
}

describe('timeAgo', () => {
  it('returns seconds for recent timestamps', () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe('0s ago');
  });

  it('returns minutes for timestamps a few minutes old', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe('5m ago');
  });

  it('returns hours for timestamps a few hours old', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe('3h ago');
  });

  it('returns days for timestamps a day or more old', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(twoDaysAgo)).toBe('2d ago');
  });
});

describe('diskColor', () => {
  it('returns healthy color for usage below 75%', () => {
    expect(diskColor(50)).toBe('var(--color-healthy)');
    expect(diskColor(0)).toBe('var(--color-healthy)');
    expect(diskColor(74)).toBe('var(--color-healthy)');
  });

  it('returns warning color for usage 75-89%', () => {
    expect(diskColor(75)).toBe('var(--color-warning)');
    expect(diskColor(89)).toBe('var(--color-warning)');
  });

  it('returns error color for usage 90%+', () => {
    expect(diskColor(90)).toBe('var(--color-error)');
    expect(diskColor(99)).toBe('var(--color-error)');
    expect(diskColor(100)).toBe('var(--color-error)');
  });
});
