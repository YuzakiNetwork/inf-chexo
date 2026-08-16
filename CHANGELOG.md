# CHEXO Changelog

## v3.1.3 — Real Role-Based Portal
- Supabase Auth role-based routing for student, teacher, and administrator.
- Protected `/siswa`, `/guru`, and `/admin` portals.
- Added role guard and server-side Supabase helper.
- Removed role selection from login flow.

## v3.1.2 — Student Dashboard Data
- Connected student dashboard profile, class, materials, and learning progress to Supabase.
- Added real progress calculations with fallback data for offline/demo use.

## v3.1.1 — Supabase Learning
- Connected materials and learning progress to Supabase.
- Added `material_assets` and `learning_progress` schema.
- Added RLS policies and database indexes.
- Added Supabase setup documentation.

## v3.1.0 — Rich Learning Materials
- Added material library search/filter UI.
- Added material detail pages.
- Added support structure for PDF, video, link, file, and embed resources.
- Added basic material completion tracking.

## v3.0.3 — Full UI Redesign
- Reworked the full website visual system around the new CHEXO LMS style.
- Added consistent header/footer and modern blue education UI.
- Updated home, materials, tasks, quiz, playground, portfolio, login, teacher, and admin pages.

## v3.0.2 — Student Dashboard
- Redesigned student dashboard based on the provided LMS reference.
- Added responsive sidebar/topbar, progress cards, schedule, activities, and profile area.
- Replaced character illustration with profile initials/avatar placeholder.

## v3.0.1 — Foundation
- Initial CHEXO v3 foundation.
- Added Next.js/TypeScript structure.
- Added student, teacher, administrator, materials, tasks, quiz, playground, portfolio, and login foundations.
- Added initial Supabase schema and project documentation.
