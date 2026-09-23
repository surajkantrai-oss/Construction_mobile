# UI/UX Audit — Modern & Warm Completion Pass

Audited and fixed in one continuous pass (build + polish combined, per direction). Classifications reflect
what was found before this pass and its resolution.

Legend: `[x]` fixed · `[ ]` open · P0 broken usability · P1 important UX · P2 visual consistency · P3 nice-to-have

## App-wide / shared

- P0 `[x]` Only the navigation shell (Phase 1–2) had Modern & Warm applied; all 13 screens still rendered the
  original pre-redesign UI (navy/blue `ui.tsx` components). Migrated every screen to the design system.
- P0 `[x]` No reusable header — Home started directly with a plain title + isolated refresh button; secondary
  screens had no header at all. Built `AppHeader` (title/subtitle/back/actions) and `HomeHeader` (greeting +
  avatar), used consistently.
- P0 `[x]` Secondary screens reached via **More** got a generic `‹ More` bar from `AppShell` **and** their own
  header — a double header. Unified into one: each secondary screen's `AppHeader` now owns the back chevron.
- P0 `[x]` Old `Sheet` modal (page-sheet `Modal`) had the "jumps too far up" keyboard issue and no consistent
  positioning rules. Replaced with `BottomSheet` (bottom-anchored, safe-area bottom padding, drag handle,
  `KeyboardAvoidingView`, scrollable) and `ConfirmDialog` (always vertically centered, for confirmations).
- P1 `[x]` Dates rendered as raw ISO (`2026-07-25`). Added `formatDate`/`formatDateTime` (display-only;
  API/DB values untouched) and used them everywhere a date is shown.
- P1 `[x]` Status pills used ad hoc tone logic per screen. Centralized in `StatusBadge` + `toneForStatus`.
- P1 `[x]` Buttons were a single blue-primary component with a `danger`/`outline` prop; "outline" still used
  blue. New `Button` has `primary` (warm orange), `secondary`, `outline` (orange), `danger`, all token-driven.
- P1 `[x]` No search/filter pattern — Projects/DPR/Tasks/Stock/Vendors/Employees had no way to narrow long
  lists. Added `SearchInput` + `FilterChip` consistently (client-side, to avoid extra network calls per
  screen — datasets are small `limit=40–50` fetches).
- P1 `[x]` Loading was a full-page spinner (`ActivityIndicator` + "Loading live data…") on every screen.
  Replaced with `Skeleton`/`CardSkeleton` for initial loads; `RefreshControl` (pull-to-refresh) for refetches.
- P1 `[x]` Empty/error states were a single line of grey text or an `Alert.alert`. Added `EmptyState` (icon +
  title + optional CTA) and `ErrorState` (icon + message + Retry) everywhere lists can be empty or fail.
- P2 `[x]` Spacing/typography were arbitrary per screen (`fontSize: 26`, `padding: 15`, mixed weights).
  Centralized in `theme/spacing.ts`, `theme/typography.ts` — 4/8/12/16/20/24/32/40 scale, one type hierarchy.
- P2 `[x]` Cards used visible grey borders + light shadow inconsistently. Standardized via `theme/shadows.ts`
  (subtle, platform-aware) and one `Card`/card-style convention.
- P2 `[x]` Icons were literal Unicode glyphs (⌂ ▣ ✓ ◷) with inconsistent stroke/weight. Replaced with Ionicons
  throughout (nav, headers, module cards, list rows, status icons) via `@expo/vector-icons`.
- P3 `[ ]` No haptics. Skipped — would need `expo-haptics` (a new native dependency); given this session hit
  real native-rebuild instability, adding one for a P3 nice-to-have wasn't worth the risk. Flagging for a
  follow-up if desired.
- P3 `[ ]` No dedicated Project Details / DPR Details screen — list rows open the edit sheet directly (same
  as before the redesign). Out of scope: adding new screens is new functionality, not polish.

## Screen-by-screen

**Login** — P1 `[x]` no keyboard avoidance (`KeyboardAvoidingView` + scroll added), P2 `[x]` old blue button/
navy branding → warm orange identity, inline error styled as a card instead of plain red text.

**Home** — P0 `[x]` header replaced with time-of-day greeting + real user name + avatar (no hardcoded name).
P1 `[x]` refresh button replaced with pull-to-refresh (kept, not removed — just relocated). P1 `[x]` KPI grid
was "first 3 keys of a merged, order-dependent object" (`{...dashboard.kpis, ...mobile}.slice(0,3)`) —
non-deterministic. Now 4 fixed, real KPIs (`activeProjects`, `pendingDprs`, `totalLabour`, `attendanceRate`)
in a responsive 2-column wrap grid (won't cramp on narrow devices — brief §41). P1 `[x]` Quick Actions now
RBAC-filtered icon cards (was 2 plain outline buttons) using only existing nav destinations. P2 `[x]` Pending
DPR / Active Project rows now have real hierarchy (title → meta → badge) and progress bars.

**Projects** — P1 `[x]` added search + status filter chips (client-side; no backend contract change). P2 `[x]`
cards now show progress bar + spent/budget with tabular hierarchy instead of a single "detail" string.

**DPR** — P0 `[x]` this is the field-critical workflow (brief §30): multi-section form (Basic Information /
Work Progress / Site Evidence) instead of one flat list of fields. P1 `[x]` photo picker now shows real
thumbnails with a remove (×) affordance and "Photos n/5" counter (was invisible until save). P1 `[x]` submit
button confirmed reachable with the keyboard/scroll in the new `BottomSheet` (verified live). P2 `[x]` bill
attachment row now shows a file icon + name instead of a plain "Choose bill" button.

**Tasks** — P1 `[x]` priority is no longer color-only — a flag icon + text label ("High priority" etc, brief
§33) sits next to the due date. P2 `[x]` status filter chips added.

**Attendance** — P1 `[x]` added Present/Absent/Total summary row (brief §34); Check-in/Check-out kept as
large primary/outline buttons. Verified live with real data (4 Present, 0 Absent — correct badge colors).

**Stock** — P1 `[x]` status shown as real "In Stock"/"Out of Stock" derived from actual computed quantity.
**Did not** add a "Low Stock" indicator — the project's own `FEATURE_PARITY.md` lists a low-stock threshold
as an unimplemented backend gap; inventing a client-side threshold would be fabricating a metric.

**Categories / Vendors** — P2 `[x]` moved from `FeatureScreens.tsx` (no dedicated file) into their own
screens with search (Vendors) and the standard header/list/empty-state pattern.

**Finance** — P1 `[x]` vendor selection in the transaction form was a raw numeric ID text field with a hint
string listing "id: name" pairs to read manually. Replaced with tappable vendor chips (same underlying
`vendorId: number` submitted — no API change). P2 `[x]` amounts get strong color/weight hierarchy, tabular
numerals. **Did not** add an Expenses tab — no Expenses UI existed before this pass and the ABSOLUTE RULE
says preserve/don't invent new functionality; `api.expenses` remains wired but unused, same as before.

**Employees** — P2 `[x]` avatar initials + role badge + search added.

**Documents** — P1 `[x]` file rows now use type-aware icons (PDF/image/spreadsheet/generic — brief §32)
instead of one generic row. P1 `[x]` tapping a document now opens it (`Linking.openURL`) instead of showing
its URL in an `Alert.alert`.

**Audit Logs** — P1 `[x]` was a plain `Row` list (brief explicitly warns against this reading "visually
heavy"). Rebuilt as a lightweight timeline (dot + connecting line + entry), per brief §"AUDIT LOG".

**Profile** — P1 `[x]` sectioned into Identity / Personal Information / Session (brief §37). P1 `[x]` "Sign
out all devices" now goes through `ConfirmDialog` with destructive styling (brief §38) instead of firing
immediately; plain "Sign out" stays a direct action (standard pattern — only the broader, harder-to-undo
action gets a confirmation gate). **Not visually re-verified live** after the last emulator restart — see
Testing section.

**More** — unchanged from the Phase 2 build (already Modern & Warm); re-verified still correct after the
full screen migration.

## Summary

- P0: 6 found → 6 fixed
- P1: 20 found → 20 fixed
- P2: 10 found → 10 fixed
- P3: 2 identified → 0 fixed (deliberately deferred, see above)
