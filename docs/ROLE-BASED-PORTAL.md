# CHEXO v3.1.3 — Real Role-Based Portal

Login no longer asks the user to choose a role. Supabase Auth identifies the account and CHEXO reads `profiles.role`.

Roles:
- `student` → `/siswa`
- `teacher` → `/guru`
- `administrator` → `/admin`

Both middleware and the client RoleGuard protect portal routes. A logged-in user attempting to open another role's portal is redirected to their own portal.

The patch expects `@supabase/ssr` to be installed (it is included in the CHEXO v3 foundation package).
