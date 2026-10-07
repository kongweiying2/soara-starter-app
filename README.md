# Soara app template

A reusable app foundation based on the official Vercel Next.js + Supabase starter. It includes email authentication, password recovery, private tasks, private file uploads, and a Vercel-ready Next.js app.

## What is included

| Capability | Implementation |
|---|---|
| AI coding | Open this folder in Claude Code or Codex; see CLAUDE.md |
| Hosting | Next.js deployment on your Vercel account |
| Database | Supabase PostgreSQL, with a versioned migration and per-user row policies |
| Uploaded files | Private Supabase Storage bucket, 10 MB upload limit, temporary downloads |
| Authentication | Supabase email signup, login, confirmation, password reset and logout |
| Code repository | Git-ready source, lockfile, ignore rules and GitHub verification workflow |

No service-role key is required by the app. Your Supabase project, Vercel project and repository must still be created in your own accounts. The template does not provision accounts or guarantee a production service level.

## First-time setup

1. Create a dedicated Supabase project. Use a new project, not a client's production database.
2. Copy `.env.example` to `.env.local`. In Supabase's Connect panel, copy the project URL and publishable key into the two matching fields. Keep `.env.local` out of Git.
3. Open the Supabase SQL editor. Run the contents of `supabase/migrations/202610070001_workspace.sql` once. This creates the tasks table, private file bucket and access rules. Do not repeatedly rerun this initial migration.
4. In Supabase Authentication → URL Configuration, set the local Site URL to `http://localhost:3000`. Allow `http://localhost:3000/**` as a local redirect URL. If using a different port, replace it everywhere.
5. Configure the confirmation and recovery email templates as described in [deployment.md](docs/deployment.md).
6. Run `npm ci`, `npm run check:setup`, then `npm run dev`. Open `http://localhost:3000`.
7. Create an account, follow the confirmation email and sign in. Add a task and upload a file. Reload and check both are still present.
8. Test with a second account. Its workspace must be empty and it must not be able to access the first account's files or tasks.

The setup screen remains visible until the project URL and key are configured. It does not simulate a signed-in account or saved data.

## Deploy and share

Follow [deployment.md](docs/deployment.md) to create your repository and import it into Vercel. Apply the database migration before trying the deployed workspace. Add the two public Supabase configuration values to Vercel and configure authentication redirects for your deployed URL.

A public homepage does not make tasks or uploaded files public. Each signed-in user has their own workspace. Downloads use a link that expires after 60 seconds; treat that link as access to the file until it expires.

## Verification

- `npm run verify`: lint, TypeScript, database policy tests and production build.
- `npm run check:setup`: checks required configuration without printing keys.
- `npm run test:integration`: uses two existing disposable accounts to check the real Supabase database and Storage API. See `docs/verification.md`.
- `.github/workflows/verify.yml`: runs the local verification commands on pushes and pull requests once the source is on GitHub.

The local PostgreSQL policy test uses PGlite and small fixtures for Supabase-owned schemas. It verifies the actual migration's policies, not hosted Auth, email delivery, or Storage HTTP behavior. Those require the integration test and browser checklist.

## Make another app from this template

Run `npm run export:template`. It creates a clean `.tar.gz` archive in the temporary directory, excluding credentials, dependencies, generated builds, screenshots and Git history. Extract it into a fresh folder and follow the setup steps with a new Supabase project.

## Project structure

```text
soara-builder-room/
├── app/
│   ├── auth/                    # Signup, login, email confirmation, recovery
│   ├── protected/
│   │   ├── page.tsx             # Private tasks and files workspace
│   │   └── actions.ts           # Authenticated database/storage operations
│   └── page.tsx                 # Home and setup state
├── components/
│   ├── ui/                      # Existing shadcn components
│   └── workspace-forms.tsx
├── lib/
│   ├── supabase/                # Official browser/server session clients
│   └── workspace.ts             # Shared upload limits and action results
├── supabase/migrations/          # Database and storage access policies
├── tests/                       # PostgreSQL policy verification
├── scripts/                     # Setup check, integration test, clean export
├── docs/                        # Deployment and verification guides
├── .github/workflows/verify.yml
├── .env.example
├── CLAUDE.md
├── package.json
├── package-lock.json
└── STARTER.md                   # Upstream provenance and work history
```

## Official references

- [Vercel Supabase starter](https://vercel.com/templates/authentication/supabase)
- [Supabase Next.js setup](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Storage policies](https://supabase.com/docs/guides/storage/security/access-control)

See STARTER.md for verification status and known limitations.

## App routes

The homepage contains an AI setup reference, not a manual checklist for the person using the app. Signup and email confirmation lead to `/onboarding`, then `/protected` for Todos. Returning users log in directly to Todos. The shared bottom tab bar links Todos and `/protected/profile`. Profile contains account details, password recovery and logout. Without Supabase configuration, these routes display setup-empty states; with configuration, they require authentication.
