/**
 * useApi — Generic async API call hook with loading/error state management.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(studentService.getStudent);
 *   useEffect(() => { execute(studentId); }, [studentId]);
 */

import { useState, useCallback, useRef } from 'react';

type ApiFunction<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;

interface UseApiState<TResult> {
  data: TResult | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<TArgs extends unknown[], TResult> extends UseApiState<TResult> {
  execute: (...args: TArgs) => Promise<TResult | null>;
  reset: () => void;
}

export function useApi<TArgs extends unknown[], TResult>(
  apiFunc: ApiFunction<TArgs, TResult>
): UseApiReturn<TArgs, TResult> {
  const [state, setState] = useState<UseApiState<TResult>>({
    data: null,
    loading: false,
    error: null,
  });

  // Track whether the component is still mounted to avoid state updates after unmount
  const mountedRef = useRef(true);

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunc(...args);
        if (mountedRef.current) {
          setState({ data: result, loading: false, error: null });
        }
        return result;
      } catch (err: any) {
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'An unexpected error occurred';

        if (mountedRef.current) {
          setState((prev) => ({ ...prev, loading: false, error: message }));
        }
        return null;
      }
    },
    [apiFunc]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

export default useApi;
