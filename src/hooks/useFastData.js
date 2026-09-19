import { useState, useEffect, useCallback, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { swrCache } from '../utils/swrCache';

/**
 * Custom SWR Hook for Instant 0ms Page Navigation & Seamless Background Sync
 * @param {string} endpoint - The API endpoint to fetch
 * @param {any} initialFallback - Default state before data arrives
 * @param {object} options - Configuration options (ttl, enabled)
 */
export function useFastData(endpoint, initialFallback = null, options = {}) {
  const { ttl = 300000, enabled = true } = options;
  const cached = endpoint ? swrCache.get(endpoint) : null;

  const [data, setData] = useState(cached !== null ? cached : initialFallback);
  const [loading, setLoading] = useState(cached === null && enabled);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const fetchData = useCallback(async (silent = false) => {
    if (!endpoint || !enabled) return;
    if (!silent && swrCache.get(endpoint) === null) {
      setLoading(true);
    }

    try {
      const response = await axiosClient.get(endpoint);
      const freshData = response.data;

      if (isMounted.current) {
        setData(freshData);
        swrCache.set(endpoint, freshData, ttl);
        setError(null);
      }
      return freshData;
    } catch (err) {
      if (isMounted.current) {
        setError(err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [endpoint, enabled, ttl]);

  useEffect(() => {
    isMounted.current = true;
    if (!endpoint || !enabled) return;

    const currentCached = swrCache.get(endpoint);
    if (currentCached !== null) {
      setData(currentCached);
      setLoading(false);
      // Revalidate in background silently
      fetchData(true);
    } else {
      fetchData(false);
    }

    return () => {
      isMounted.current = false;
    };
  }, [endpoint, enabled, fetchData]);

  const mutate = useCallback((updater, shouldRevalidate = false) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (endpoint) {
        swrCache.set(endpoint, next, ttl);
      }
      return next;
    });

    if (shouldRevalidate) {
      fetchData(true);
    }
  }, [endpoint, ttl, fetchData]);

  return {
    data,
    loading,
    error,
    mutate,
    revalidate: () => fetchData(true)
  };
}
