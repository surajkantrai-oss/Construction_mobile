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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Formats an ISO/date-ish string for display only, e.g. "25 Jul 2026". Never touches the underlying stored value. */
export const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

/** Same as formatDate but includes the time, e.g. "25 Jul 2026, 6:45 PM". */
export const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const hours = date.getHours();
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${formatDate(value)}, ${displayHour}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
};
