import { useState, useMemo, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { StorageNode } from '../types';
import StatusBadge from './StatusBadge';
import styles from './NodeTable.module.css';

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

interface ServerPagination {
  page: number;
  pageSize: number;
  totalNodes: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

interface Props {
  nodes: StorageNode[];
  allNodes?: StorageNode[];
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  serverPagination?: ServerPagination;
}

type ViewMode = 'paginated' | 'virtual';

export default function NodeTable({ nodes, allNodes = [], isLoadingMore, hasMore, onLoadMore, serverPagination: sp }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('paginated');
  const scrollRef = useRef<HTMLDivElement>(null);

  const columns = useMemo<ColumnDef<StorageNode, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Node ID',
        cell: (info) => <code>{info.getValue() as string}</code>,
      },
      { accessorKey: 'hostname', header: 'Hostname' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => <StatusBadge status={info.getValue() as StorageNode['status']} />,
      },
      {
        accessorKey: 'diskUsagePercent',
        header: 'Disk Usage',
        cell: (info) => {
          const pct = info.getValue() as number;
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className={styles.diskBar}>
                <div className={styles.diskBarFill} style={{ width: `${pct}%`, background: diskColor(pct) }} />
              </div>
              <span>{pct}%</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'ioThroughputMBps',
        header: 'IO Throughput',
        cell: (info) => `${info.getValue()} MB/s`,
      },
      {
        accessorKey: 'lastHeartbeat',
        header: 'Last Heartbeat',
        cell: (info) => timeAgo(info.getValue() as string),
      },
    ],
    [],
  );

  // Paginated mode table (uses server data)
  const paginatedTable = useReactTable({
    data: nodes,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
  });

  // Virtual mode table (uses accumulated allNodes)
  const virtualTable = useReactTable({
    data: allNodes,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const virtualRows = virtualTable.getFilteredRowModel().rows;

  const virtualizer = useVirtualizer({
    count: virtualRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 48,
    overscan: 20,
  });

  // Infinite scroll: load more when near the bottom
  useEffect(() => {
    if (viewMode !== 'virtual' || !onLoadMore || !hasMore || isLoadingMore) return;

    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight - scrollTop - clientHeight < 500) {
        onLoadMore();
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [viewMode, onLoadMore, hasMore, isLoadingMore]);

  const activeTable = viewMode === 'paginated' ? paginatedTable : virtualTable;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search nodes by ID or hostname..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'paginated' ? styles.toggleBtnActive : ''}`}
            onClick={() => setViewMode('paginated')}
          >
            Paginated
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'virtual' ? styles.toggleBtnActive : ''}`}
            onClick={() => setViewMode('virtual')}
          >
            Virtual Scroll
          </button>
        </div>
      </div>

      {viewMode === 'paginated' ? (
        <>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                {activeTable.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? ''}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {activeTable.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sp && (
            <div className={styles.pagination}>
              <span>Showing {nodes.length} of {sp.totalNodes.toLocaleString()} nodes</span>
              <div className={styles.pageBtns}>
                <button onClick={() => sp.onPageChange(1)} disabled={sp.page <= 1}>{'<<'}</button>
                <button onClick={() => sp.onPageChange(sp.page - 1)} disabled={sp.page <= 1}>{'<'}</button>
                <span>Page {sp.page.toLocaleString()} of {sp.totalPages.toLocaleString()}</span>
                <button onClick={() => sp.onPageChange(sp.page + 1)} disabled={sp.page >= sp.totalPages}>{'>'}</button>
                <button onClick={() => sp.onPageChange(sp.totalPages)} disabled={sp.page >= sp.totalPages}>{'>>'}</button>
                <select
                  className={styles.pageSelect}
                  value={sp.pageSize}
                  onChange={(e) => sp.onPageSizeChange(Number(e.target.value))}
                >
                  {[25, 50, 100].map((size) => (
                    <option key={size} value={size}>Show {size}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className={styles.virtualHeader}>
            <table className={styles.table}>
              <thead>
                {activeTable.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? ''}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
            </table>
          </div>
          <div ref={scrollRef} className={styles.virtualContainer}>
            <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = virtualRows[virtualRow.index];
                return (
                  <div
                    key={row.id}
                    className={styles.virtualRow}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: virtualRow.size,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div key={cell.id} className={styles.virtualCell}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            {isLoadingMore && (
              <div className={styles.loadingMore}>Loading more nodes...</div>
            )}
          </div>
          <div className={styles.pagination}>
            <span>
              Loaded {allNodes.length.toLocaleString()}
              {sp ? ` of ${sp.totalNodes.toLocaleString()}` : ''} nodes
              {hasMore ? ' — scroll for more' : ' — all loaded'}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
