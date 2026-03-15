import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import type { StorageNode } from '../types';
import NodeTable from '../components/NodeTable';
import ScaleSelector from '../components/ScaleSelector';

export default function Nodes() {
  const [nodes, setNodes] = useState<StorageNode[]>([]);
  const [totalNodes, setTotalNodes] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(0);

  // Infinite scroll state
  const [allNodes, setAllNodes] = useState<StorageNode[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const nextPageRef = useRef(1);
  const loadingRef = useRef(false);

  function fetchPage(p: number, ps: number) {
    api.getNodes({ page: p, pageSize: ps })
      .then((res) => {
        setNodes(res.data);
        setTotalNodes(res.total);
        setTotalPages(res.totalPages);
        setPage(res.page);
        setPageSize(res.pageSize);
      })
      .catch(() => {});
  }

  const fetchNextBatch = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoadingMore(true);

    const batchSize = 200;
    api.getNodes({ page: nextPageRef.current, pageSize: batchSize })
      .then((res) => {
        setAllNodes((prev) => [...prev, ...res.data]);
        setTotalNodes(res.total);
        nextPageRef.current++;
        setHasMore(nextPageRef.current <= res.totalPages);
      })
      .catch(() => {})
      .finally(() => {
        loadingRef.current = false;
        setIsLoadingMore(false);
      });
  }, []);

  // Initial load — runs once
  useEffect(() => {
    fetchPage(1, 25);
    fetchNextBatch();

    const unsub = wsService.subscribe('node:update', (data: { nodeId: string; node: StorageNode }) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === data.nodeId ? data.node : n))
      );
      setAllNodes((prev) =>
        prev.map((n) => (n.id === data.nodeId ? data.node : n))
      );
    });

    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 10 }}>
        Storage Nodes
        {totalNodes > 0 && (
          <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 12 }}>
            ({totalNodes.toLocaleString()} total)
          </span>
        )}
      </h2>
      <ScaleSelector onScaleChange={() => {
        setAllNodes([]);
        nextPageRef.current = 1;
        setHasMore(true);
        loadingRef.current = false;
        fetchPage(1, 25);
        fetchNextBatch();
      }} />
      <NodeTable
        nodes={nodes}
        allNodes={allNodes}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={fetchNextBatch}
        serverPagination={{
          page,
          pageSize,
          totalNodes,
          totalPages,
          onPageChange: (p) => fetchPage(p, pageSize),
          onPageSizeChange: (ps) => fetchPage(1, ps),
        }}
      />
    </div>
  );
}
