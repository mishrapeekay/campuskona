/**
 * usePagination — Paginated list fetching hook for list screens.
 *
 * Handles:
 * - Initial fetch
 * - Load more (infinite scroll)
 * - Pull-to-refresh
 * - Cursor or page-based pagination
 *
 * Usage:
 *   const { items, loading, refreshing, hasMore, loadMore, refresh } =
 *     usePagination((page) => studentService.getStudents({ page, page_size: 20 }));
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface PaginatedResponse<T> {
  results: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

type PageFetcher<T> = (page: number) => Promise<PaginatedResponse<T>>;

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  autoFetch?: boolean;
}

interface UsePaginationReturn<T> {
  items: T[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalCount: number;
  loadMore: () => void;
  refresh: () => void;
  reset: () => void;
}

export function usePagination<T>(
  fetcher: PageFetcher<T>,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { initialPage = 1, autoFetch = true } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);

  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (autoFetch) {
      fetchPage(initialPage, true);
    }
    return () => {
      mountedRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPage = useCallback(
    async (page: number, isRefresh = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await fetcher(page);

        if (!mountedRef.current) return;

        const newItems = response.results ?? [];
        const total = response.count ?? 0;
        const hasNext = Boolean(response.next);

        setItems((prev) => (isRefresh || page === initialPage ? newItems : [...prev, ...newItems]));
        setHasMore(hasNext);
        setCurrentPage(page);
        setTotalCount(total);
      } catch (err: any) {
        if (!mountedRef.current) return;
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load data';
        setError(message);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
        isFetchingRef.current = false;
      }
    },
    [fetcher, initialPage]
  );

  const loadMore = useCallback(() => {
    if (!loading && !refreshing && hasMore) {
      fetchPage(currentPage + 1, false);
    }
  }, [loading, refreshing, hasMore, currentPage, fetchPage]);

  const refresh = useCallback(() => {
    fetchPage(initialPage, true);
  }, [initialPage, fetchPage]);

  const reset = useCallback(() => {
    setItems([]);
    setCurrentPage(initialPage);
    setHasMore(true);
    setError(null);
    setTotalCount(0);
  }, [initialPage]);

  return {
    items,
    loading,
    refreshing,
    error,
    hasMore,
    currentPage,
    totalCount,
    loadMore,
    refresh,
    reset,
  };
}

export default usePagination;
