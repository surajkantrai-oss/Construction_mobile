export type UserRole = 'owner' | 'engineer' | 'supervisor' | 'accountant' | 'labour';
export type DPRStatus = 'pending' | 'submitted' | 'approved' | 'rejected';
export type ProjectStatus = 'active' | 'on-hold' | 'completed';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface User { id: number; name: string; email: string; role: UserRole; phone?: string; status?: string; }
export interface Session { token: string; refreshToken?: string; user: User; }
export interface Pagination<T> { data: T[]; total: number; page: number; limit: number; totalPages: number; }
export interface Project { id: number; name: string; location: string; status: ProjectStatus; progress: number; budget: number; spent: number; startDate: string; endDate: string; manager: string; tasks?: Task[]; }
export interface Task { id: number; title: string; description: string; status: TaskStatus; priority: 'low' | 'medium' | 'high'; dueDate: string; projectId: number; assigneeId: number; project?: string; assignee?: string; }
export interface DPR { id: number; date: string; siteName: string; supervisorId?: number; labourCount: number; workDescription: string; materialUsed: string; materialWastage: string; notes?: string | null; status: DPRStatus; supervisor?: User; imageUrls?: string[]; billUrl?: string | null; createdAt?: string; updatedAt?: string; }
export interface Attendance { id: number; userId: number; name?: string; role?: UserRole; department?: string; date: string; checkIn?: string; checkOut?: string; status: 'present' | 'absent' | 'late'; }
export interface MaterialCategory { id: number; name: string; }
export interface Material { id: number; name: string; unit: string; categoryId?: number | null; category?: MaterialCategory | null; stocks?: Stock[]; createdAt?: string; }
export interface Stock { id: number; materialId: number; quantity: number; type: 'in' | 'out'; note?: string | null; createdAt?: string; material?: Material; }
export interface Vendor { id: number; name: string; contact: string; gstNumber?: string | null; transactions?: Transaction[]; createdAt?: string; }
export interface Transaction { id: number; vendorId: number; amount: number; type: 'credit' | 'debit'; description?: string | null; createdAt?: string; vendor?: Vendor; }
export interface Expense { id: number; title: string; amount: number; category: string; billUrl?: string | null; createdAt?: string; createdBy?: User; }
export interface Document { id: number; name: string; filename?: string; type: string; size: string; uploadedBy: string; uploadedById?: number; date: string; folder: string; }
export interface AuditRecord { id: number; module: string; action: string; recordId: number; role?: string | null; createdAt: string; userId?: number | null; }
export interface Dashboard { kpis: Record<string, number>; charts?: Record<string, unknown[]>; recentActivity: { pendingDprs: DPR[]; recentExpenses: Expense[]; activeProjectsList: Project[] }; }
