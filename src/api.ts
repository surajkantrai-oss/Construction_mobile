import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Attendance, AuditRecord, Dashboard, Document, DPR, Expense, Material, MaterialCategory, Pagination, Project, Session, Stock, Task, Transaction, User, Vendor } from './types';

const SESSION_KEY = 'buildcorp.session';
const DEFAULT_API_URL = Platform.select({ android: 'http://10.0.2.2:4000', default: 'http://localhost:4000' })!;
const API_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 20_000;

export class ApiError extends Error { constructor(public readonly status: number, message: string, public readonly details?: unknown) { super(message); this.name = 'ApiError'; } }
let activeSession: Session | null = null;
let refreshPromise: Promise<Session> | null = null;

export const sessionStore = {
  async load() { const value = await SecureStore.getItemAsync(SESSION_KEY); activeSession = value ? JSON.parse(value) as Session : null; return activeSession; },
  async save(session: Session) { activeSession = session; await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session)); },
  async clear() { activeSession = null; await SecureStore.deleteItemAsync(SESSION_KEY); },
};
const unwrap = <T,>(payload: unknown): T => payload && typeof payload === 'object' && 'status' in payload && 'data' in payload ? (payload as { data: T }).data : payload as T;
const json = (method: string, body?: unknown): RequestInit => ({ method, body: body === undefined ? undefined : JSON.stringify(body) });
const query = (params?: Record<string, string | number | undefined>) => { const entries = Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== ''); return entries.length ? `?${entries.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join('&')}` : ''; };

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = new Headers(options.headers);
  if (activeSession?.token) headers.set('Authorization', `Bearer ${activeSession.token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  try {
    const response = await fetch(`${API_URL}${path}`, { ...options, headers, signal: controller.signal });
    const raw = await response.text(); let body: unknown = null; try { body = raw ? JSON.parse(raw) : null; } catch { body = raw; }
    if (response.status === 401 && retry && activeSession?.refreshToken && path !== '/api/auth/refresh') { await refreshSession(); return request<T>(path, options, false); }
    const message = body && typeof body === 'object' && 'message' in body ? String((body as { message: unknown }).message) : `Request failed (${response.status})`;
    if (!response.ok || (body && typeof body === 'object' && 'status' in body && (body as { status: boolean }).status === false)) throw new ApiError(response.status, message, body);
    return unwrap<T>(body);
  } catch (error) { if (error instanceof ApiError) throw error; if (error instanceof Error && error.name === 'AbortError') throw new ApiError(0, 'The request timed out. Check your connection and retry.'); throw new ApiError(0, 'Unable to reach the server. Check the API URL and your network connection.'); } finally { clearTimeout(timeout); }
}
async function refreshSession() {
  if (!activeSession?.refreshToken) throw new ApiError(401, 'Your session has expired. Please sign in again.');
  if (!refreshPromise) refreshPromise = request<{ token: string; refreshToken: string }>('/api/auth/refresh', json('POST', { refreshToken: activeSession.refreshToken }), false).then(async tokens => { const next = { ...activeSession!, ...tokens }; await sessionStore.save(next); return next; }).catch(async error => { await sessionStore.clear(); throw error; }).finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export const authApi = { login: (email: string, password: string) => request<Session>('/api/auth/login', json('POST', { email, password })), verify: () => request<{ user: User }>('/api/protected'), logout: () => request<void>('/api/auth/logout', json('POST', { refreshToken: activeSession?.refreshToken })), logoutAll: () => request<void>('/api/auth/logout-all', json('POST')), profile: (payload: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) => request<User>('/api/auth/profile', json('PUT', payload)) };
export const api = {
  dashboard: () => request<Dashboard>('/api/dashboard'), notifications: () => request<Array<{ id: string; title: string; message: string; type: string }>>('/api/dashboard/notifications'), mobileDashboard: () => request<Record<string, number | boolean>>('/api/mobile/dashboard'),
  projects: { list: (params?: Record<string, string | number>) => request<Pagination<Project>>(`/api/projects${query(params)}`), get: (id: number) => request<Project>(`/api/projects/${id}`), create: (data: Partial<Project>) => request<Project>('/api/projects', json('POST', data)), update: (id: number, data: Partial<Project>) => request<Project>(`/api/projects/${id}`, json('PUT', data)) },
  dprs: { list: (params?: Record<string, string | number>) => request<Pagination<DPR>>(`/api/dpr${query(params)}`), get: (id: number) => request<DPR>(`/api/dpr/${id}`), mine: () => request<DPR[]>('/api/mobile/dprs'), create: (data: FormData) => request<DPR>('/api/dpr', { method: 'POST', body: data }), update: (id: number, data: FormData) => request<DPR>(`/api/dpr/${id}`, { method: 'PUT', body: data }), status: (id: number, status: string) => request<DPR>(`/api/dpr/${id}/status`, json('PUT', { status })) },
  tasks: { list: () => request<Task[]>('/api/tasks'), mine: () => request<Task[]>('/api/mobile/tasks'), create: (data: Partial<Task>) => request<Task>('/api/tasks', json('POST', data)), update: (id: number, data: Partial<Task>) => request<Task>(`/api/tasks/${id}`, json('PUT', data)) },
  attendance: { list: () => request<Attendance[]>('/api/attendance'), log: (data: Partial<Attendance>) => request<Attendance>('/api/attendance', json('POST', data)), mobile: (action: 'check-in' | 'check-out') => request<Attendance>('/api/mobile/attendance', json('POST', { action })) },
  materials: { list: (params?: Record<string, string | number>) => request<Pagination<Material>>(`/api/materials${query(params)}`), get: (id: number) => request<Material>(`/api/materials/${id}`), create: (data: { name: string; unit: string; categoryId?: number | null; newCategoryName?: string }) => request<Material>('/api/materials', json('POST', data)), update: (id: number, data: Partial<Material>) => request<Material>(`/api/materials/${id}`, json('PUT', data)), remove: (id: number) => request<void>(`/api/materials/${id}`, { method: 'DELETE' }), stock: (data: Omit<Stock, 'id' | 'createdAt'>) => request<Stock>('/api/stocks', json('POST', data)) },
  categories: { list: (params?: Record<string, string | number>) => request<Pagination<MaterialCategory>>(`/api/material-categories${query(params)}`), create: (name: string) => request<MaterialCategory>('/api/material-categories', json('POST', { name })), update: (id: number, name: string) => request<MaterialCategory>(`/api/material-categories/${id}`, json('PUT', { name })), remove: (id: number) => request<void>(`/api/material-categories/${id}`, { method: 'DELETE' }) },
  vendors: { list: (params?: Record<string, string | number>) => request<Pagination<Vendor>>(`/api/vendors${query(params)}`), get: (id: number) => request<Vendor>(`/api/vendors/${id}`), create: (data: Partial<Vendor>) => request<Vendor>('/api/vendors', json('POST', data)), update: (id: number, data: Partial<Vendor>) => request<Vendor>(`/api/vendors/${id}`, json('PUT', data)), remove: (id: number) => request<void>(`/api/vendors/${id}`, { method: 'DELETE' }) },
  transactions: { list: (params?: Record<string, string | number>) => request<Pagination<Transaction>>(`/api/transactions${query(params)}`), create: (data: Partial<Transaction>) => request<Transaction>('/api/transactions', json('POST', data)) }, expenses: { list: (params?: Record<string, string | number>) => request<Pagination<Expense>>(`/api/expenses${query(params)}`), create: (data: FormData) => request<Expense>('/api/expenses', { method: 'POST', body: data }) },
  employees: { list: (params?: Record<string, string | number>) => request<Pagination<User>>(`/api/employees${query(params)}`), get: (id: number) => request<User>(`/api/employees/${id}`), create: (data: Partial<User> & { password?: string }) => request<User>('/api/employees', json('POST', data)), update: (id: number, data: Partial<User>) => request<User>(`/api/employees/${id}`, json('PUT', data)) }, documents: { list: () => request<Document[]>('/api/documents'), create: (data: FormData) => request<Document>('/api/documents', { method: 'POST', body: data }) }, audit: { list: (params?: Record<string, string | number>) => request<Pagination<AuditRecord>>(`/api/audit-logs${query(params)}`), export: (moduleName: string, filtersUsed?: unknown) => request<void>('/api/audit-logs/export', json('POST', { moduleName, filtersUsed })) },
};
export const apiUrl = API_URL; export const uploadUrl = (filename: string) => `${API_URL}/uploads/${encodeURIComponent(filename)}`;
