import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';
import type { UserRole } from '../types';

export type Section = 'home' | 'dpr' | 'tasks' | 'attendance' | 'projects' | 'stock' | 'categories' | 'vendors' | 'finance' | 'people' | 'documents' | 'audit' | 'profile' | 'more';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export interface NavItem { id: Section; label: string; icon: IconName; iconActive: IconName; roles: UserRole[]; }

/** The five fixed bottom-tab destinations. "more" has no role restriction — its grid contents are filtered individually. */
export const primaryTabs: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home', roles: ['owner', 'engineer', 'supervisor', 'accountant', 'labour'] },
  { id: 'projects', label: 'Projects', icon: 'business-outline', iconActive: 'business', roles: ['owner', 'engineer'] },
  { id: 'dpr', label: 'DPR', icon: 'document-text-outline', iconActive: 'document-text', roles: ['owner', 'engineer', 'supervisor'] },
  { id: 'tasks', label: 'Tasks', icon: 'checkmark-done-outline', iconActive: 'checkmark-done', roles: ['owner', 'engineer', 'supervisor', 'labour'] },
  { id: 'more', label: 'More', icon: 'grid-outline', iconActive: 'grid', roles: ['owner', 'engineer', 'supervisor', 'accountant', 'labour'] },
];

/** Secondary modules, reachable only from the More screen. */
export const moreItems: Array<NavItem & { description: string; tone: 'green' | 'blue' | 'orange' | 'coral' }> = [
  { id: 'attendance', label: 'Attendance', description: 'Mark daily attendance', icon: 'time-outline', iconActive: 'time', roles: ['owner', 'supervisor', 'labour', 'engineer'], tone: 'orange' },
  { id: 'stock', label: 'Stock', description: 'Materials & inventory', icon: 'cube-outline', iconActive: 'cube', roles: ['owner', 'engineer'], tone: 'green' },
  { id: 'categories', label: 'Categories', description: 'Material classifications', icon: 'pricetags-outline', iconActive: 'pricetags', roles: ['owner', 'engineer'], tone: 'green' },
  { id: 'vendors', label: 'Vendors', description: 'Manage vendors', icon: 'briefcase-outline', iconActive: 'briefcase', roles: ['owner', 'accountant'], tone: 'blue' },
  { id: 'finance', label: 'Finance', description: 'Transactions & expenses', icon: 'cash-outline', iconActive: 'cash', roles: ['owner', 'accountant'], tone: 'blue' },
  { id: 'people', label: 'Employees', description: 'Team management', icon: 'people-outline', iconActive: 'people', roles: ['owner'], tone: 'coral' },
  { id: 'documents', label: 'Documents', description: 'Files & attachments', icon: 'folder-open-outline', iconActive: 'folder-open', roles: ['owner', 'engineer', 'accountant'], tone: 'coral' },
  { id: 'audit', label: 'Audit Logs', description: 'Activity history', icon: 'shield-checkmark-outline', iconActive: 'shield-checkmark', roles: ['owner'], tone: 'orange' },
  { id: 'profile', label: 'Profile', description: 'Your account', icon: 'person-circle-outline', iconActive: 'person-circle', roles: ['owner', 'engineer', 'supervisor', 'accountant', 'labour'], tone: 'blue' },
];

export const secondarySections: Section[] = moreItems.map(item => item.id);

/** Kept for any code that still imports the flat list (e.g. role-count checks). */
export const navigationItems: NavItem[] = [...primaryTabs.filter(item => item.id !== 'more'), ...moreItems];
