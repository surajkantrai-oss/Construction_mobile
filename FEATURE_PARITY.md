# Construction Mobile Feature Parity

This matrix was audited from `construction-admin` and `ConstructionApp` on 2026-09-13. The local web server (`http://localhost:5173`) and API (`http://localhost:4000`) were not reachable during the audit, so source code and route contracts are the reference.

| Web feature | Web route | Backend API | Roles | Mobile screen | Status |
| --- | --- | --- | --- | --- | --- |
| Session login/logout/profile | `/login`, `/profile`, `/change-password` | `/api/auth/login`, `/refresh`, `/logout`, `/logout-all`, `/profile`, `/protected` | all | Login, Profile | [ ] Pending |
| Dashboard | `/` | `/api/dashboard`, `/api/dashboard/notifications`, `/api/mobile/dashboard` | all | Home | [ ] Pending |
| Projects | `/projects`, `/projects/new`, `/projects/:id` | `/api/projects` | read: all authenticated; mutate: owner, engineer | Projects | [ ] Pending |
| Daily progress reports | `/dpr`, `/dpr/new`, `/dpr/:id` | `/api/dpr`, `/api/mobile/dprs` | read: all; create/edit: owner, engineer, supervisor; status: owner, engineer | DPRs | [ ] Pending |
| Materials and stock | `/stock`, `/stock/materials/new`, `/stock/log` | `/api/materials`, `/api/material-categories`, `/api/stocks` | authenticated (web navigation: owner, engineer) | Materials & Stock | [ ] Pending |
| Material categories | `/categories` | `/api/material-categories` | authenticated (web navigation: owner, engineer) | Categories | [ ] Pending |
| Attendance | `/attendance`, `/attendance/new` | `/api/attendance`, `/api/mobile/attendance` | authenticated (web navigation: owner, supervisor, labour) | Attendance | [ ] Pending |
| Tasks | `/tasks`, `/tasks/new`, `/tasks/:id/edit` | `/api/tasks`, `/api/mobile/tasks` | authenticated | Tasks | [ ] Pending |
| Vendors | `/vendors`, `/vendors/new`, `/vendors/:id/edit` | `/api/vendors` | authenticated (web navigation: owner, accountant) | Vendors | [ ] Pending |
| Transactions / owner ledger | `/vendors/transaction/new` | `/api/transactions` | owner, accountant | Finance | [ ] Pending |
| Expenses | `/expenses/new` | `/api/expenses` | authenticated | Finance | [ ] Pending |
| Documents | `/documents` | `/api/documents`, `/uploads/:filename` | authenticated (web navigation: owner, engineer, accountant) | Documents | [ ] Pending |
| Employees | `/employees`, `/employees/new`, `/employees/:id` | `/api/employees` | owner writes; reads currently authenticated | Employees | [ ] Pending |
| Audit logs | `/audit-logs` | `/api/audit-logs`, `/api/audit-logs/export` | owner | Audit logs | [ ] Pending |

## Backend gaps — not implemented and therefore not invented on mobile

- Material requests, incoming materials, consumption, and wastage records beyond the free-text DPR fields.
- Measurements, contractors, bills/invoices, payments, and GST calculations.
- Project-linked labour, material, finance, or document relations beyond the existing independent models.
- DPR deletion, document deletion/download endpoint, material low-stock threshold, and project archive/deactivate endpoints.

These must remain blocked until the backend exposes compatible APIs and data models.
