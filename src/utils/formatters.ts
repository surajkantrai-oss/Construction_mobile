import type { UserRole } from '../types';

export const roleName = (role: UserRole) => `${role[0].toUpperCase()}${role.slice(1)}`;

export const rupees = (value?: number) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const statusTone = (status?: string) => {
  if (['approved', 'done', 'active', 'present'].includes(status || '')) return 'green';
  if (['rejected', 'absent'].includes(status || '')) return 'red';
  if (['pending', 'submitted', 'in-progress'].includes(status || '')) return 'amber';
  return 'slate';
};
