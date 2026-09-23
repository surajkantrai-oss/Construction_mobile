import type { UserRole } from '../types';

export const can = (role: UserRole, roles: UserRole[]) => roles.includes(role);
