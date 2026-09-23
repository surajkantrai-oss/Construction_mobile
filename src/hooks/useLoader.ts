import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../api';

export type Loadable<T> = { value: T; busy: boolean; error: string };

export const errorText = (error: unknown) => (error instanceof ApiError ? error.message : 'Something went wrong. Please retry.');

/** Fetches on mount and whenever `deps` changes; `refresh` re-runs without clearing the current value (used for pull-to-refresh). */
export function useLoader<T>(load: () => Promise<T>, initial: T, deps: unknown[] = []) {
  const [state, setState] = useState<Loadable<T>>({ value: initial, busy: true, error: '' });
  const refresh = useCallback(async () => {
    setState(current => ({ ...current, busy: true, error: '' }));
    try {
      const value = await load();
      setState({ value, busy: false, error: '' });
    } catch (error) {
      setState(current => ({ ...current, busy: false, error: errorText(error) }));
    }
  }, deps);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return { ...state, refresh };
}
