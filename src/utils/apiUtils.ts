import type { Pagination } from '../types';

/** Backend list endpoints sometimes return a bare array and sometimes a Pagination envelope; normalize to an array. */
export const pageData = <T,>(value: Pagination<T> | T[] | undefined) => (Array.isArray(value) ? value : (value?.data ?? []));
