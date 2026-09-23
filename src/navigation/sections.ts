import type { UserRole } from '../types';

export type Section = 'home' | 'dpr' | 'tasks' | 'attendance' | 'projects' | 'stock' | 'categories' | 'vendors' | 'finance' | 'people' | 'documents' | 'audit' | 'profile';

export const navigationItems: Array<{ id: Section; label: string; icon: string; roles: UserRole[] }> = [
  { id: 'home', label: 'Home', icon: '⌂', roles: ['owner', 'engineer', 'supervisor', 'accountant', 'labour'] },
  { id: 'dpr', label: 'DPR', icon: '▣', roles: ['owner', 'engineer', 'supervisor'] },
  { id: 'tasks', label: 'Tasks', icon: '✓', roles: ['owner', 'engineer', 'supervisor', 'labour'] },
  { id: 'attendance', label: 'Attendance', icon: '◷', roles: ['owner', 'supervisor', 'labour'] },
  { id: 'projects', label: 'Projects', icon: '⌑', roles: ['owner', 'engineer'] },
  { id: 'stock', label: 'Stock', icon: '▤', roles: ['owner', 'engineer'] },
  { id: 'categories', label: 'Categories', icon: '◫', roles: ['owner', 'engineer'] },
  { id: 'vendors', label: 'Vendors', icon: '▣', roles: ['owner', 'accountant'] },
  { id: 'finance', label: 'Finance', icon: '₹', roles: ['owner', 'accountant'] },
  { id: 'people', label: 'People', icon: '♙', roles: ['owner'] },
  { id: 'documents', label: 'Docs', icon: '▱', roles: ['owner', 'engineer', 'accountant'] },
  { id: 'audit', label: 'Audit', icon: '◫', roles: ['owner'] },
  { id: 'profile', label: 'Profile', icon: '◉', roles: ['owner', 'engineer', 'supervisor', 'accountant', 'labour'] },
];
