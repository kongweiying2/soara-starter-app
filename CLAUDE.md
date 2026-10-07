# Working on this template

Read README.md and docs/verification.md first. If a local STARTER.md work log exists, consult it too. This is the official Next.js/Supabase starter extended with private tasks and private files.

- Keep signup/login/recovery on the existing Supabase SSR integration.
- Use the signed-in user's client. Do not introduce a service-role key into runtime app code.
- Every new user-owned table must have explicit grants and row-level policies, with tests for two users.
- Keep the file bucket private. Restrict paths to the current user's ID; use expiring downloads.
- Store schema changes in new migration files, not ad hoc startup SQL.
- Keep credentials out of source, exports and screenshots.
- Use existing shadcn components; keep setup/error states honest when Supabase is unavailable.
- Run npm run verify. Run the real integration check only against dedicated test accounts.
- Do not commit, create a remote repository or deploy without the user's request.
