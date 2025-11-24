/**
 * Custom hook for background polling without showing loading indicators
 * 
 * @param fetchFn - Function to fetch data
 * @param intervalMs - Polling interval in milliseconds (default: 30000 = 30 seconds)
 * @param immediate - Whether to fetch immediately on mount (default: true)
 * 
 * @example
 * ```tsx
 * const fetchData = async () => {
 *   const data = await api.getData();
 *   setData(data);
 * };
 * 
 * useBackgroundPolling(fetchData, 30000);
 * ```
 */
import { useEffect, useRef } from 'react';

export function useBackgroundPolling(
  fetchFn: () => Promise<void> | void,
  intervalMs: number = 30000,
  immediate: boolean = true
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchFnRef = useRef(fetchFn);

  // Keep fetchFn ref updated
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    // Wrapper function that uses the latest fetchFn
    const executeFetch = () => {
      try {
        const result = fetchFnRef.current();
        // Handle both sync and async functions
        if (result instanceof Promise) {
          result.catch((error) => {
            // Silently fail - don't show errors in background polling
            console.debug('Background polling failed (silent):', error);
          });
        }
      } catch (error) {
        // Silently fail for sync errors too
        console.debug('Background polling failed (silent):', error);
      }
    };

    // Initial fetch if immediate is true
    if (immediate) {
      executeFetch();
    }

    // Set up polling interval
    intervalRef.current = setInterval(executeFetch, intervalMs);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalMs, immediate]);
}

