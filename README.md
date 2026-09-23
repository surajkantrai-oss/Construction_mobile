# BuildCorp Mobile

React Native / Expo client for the BuildCorp construction-management backend.

## Included workflows

- Secure JWT + refresh-token session storage and sign-out
- Role-aware navigation for owner, engineer, supervisor, accountant, and labour users
- Live dashboard, DPR submission/review, tasks, mobile attendance, projects, stock, finance, employees, documents, profile, and owner audit history
- Multipart document upload for images and PDFs
- Automatic token refresh on an expired access token

## Run locally

1. Start PostgreSQL, Redis, and the backend from `../ConstructionApp`.
2. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`.
   - iOS simulator: `http://localhost:4000`
   - Android emulator: `http://10.0.2.2:4000`
   - Expo Go on a phone: your computer's LAN IP, e.g. `http://192.168.29.248:4000`
3. Run `npm start`, then open the QR code using Expo Go or use `npm run ios` / `npm run android`.

The mobile navigation is a convenience layer; backend authorization remains the source of truth for each API action.
