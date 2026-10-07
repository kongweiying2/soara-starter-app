# Verification

`npm run verify` checks lint, types, the real SQL policies in a local PostgreSQL engine, and the production build. It requires no account credentials.

The PGlite test supplies minimal fixtures for Supabase-owned auth/storage schemas. It checks own-user reads and writes, rejects foreign ownership, rejects anonymous access, and verifies that the bucket is private. It does not start Supabase's hosted Auth or Storage services.

## Real integration check

Use a dedicated Supabase test project. Apply the migration and create two confirmed test accounts. Put these values in the ignored `.env.e2e.local` file:

```dotenv
ALLOW_TEST_DATA_WRITES=1
E2E_USER_ONE_EMAIL=
E2E_USER_ONE_PASSWORD=
E2E_USER_TWO_EMAIL=
E2E_USER_TWO_PASSWORD=
```

The two public connection values may remain in `.env.local`. Run `npm run test:integration`. It signs in both accounts, checks task persistence and completion, uploads/downloads a disposable text file, rejects cross-user reads and download links, and cleans up its own records. It does not create users or reset the database. If cleanup fails, remove its disposable test records manually.

## Browser acceptance checklist

1. Home → create account → confirm email → login → workspace.
2. Add task → reload → complete → reload → reopen → delete.
3. Upload allowed file → reload → download → delete.
4. Try a file exceeding 10 MB and an unsupported type. Both must be rejected.
5. Sign out → attempt workspace access → login page.
6. Log in as another user. No foreign tasks or files should be visible.
7. Request password recovery → follow email → change password → log in again.
8. Repeat the key steps on the Vercel deployment.

No hosted integration run is claimed until dedicated Supabase credentials are configured and these checks actually pass.

## Email flow verification

Set `E2E_SIGNUP_EMAIL` in `.env.local` to the inbox you want the AI to use when checking signup confirmation and recovery. This is test configuration only and is not exposed to app visitors. The initial value is supplied by the app owner. A new account password must be entered in the browser by the user. Keep confirmation enabled; verify the received message and callback in the same browser that submitted signup. Default Supabase delivery is restricted to authorized organization addresses. For other recipients, configure custom SMTP rather than disabling confirmation.

## Automated browser suite

The Playwright suite runs against the real dedicated Supabase project using ordinary confirmed test accounts. It does not use mocked Auth, tasks or Storage, create accounts, send mail, reset the database or alter passwords.

```sh
npx playwright install chromium
npm run test:e2e
```

The command builds the production app and starts its own server on port 3207, leaving the review server on 3206 alone. `npm run test:e2e:ui` opens Playwright's interactive runner. The same `.env.e2e.local` configuration used for integration checks is required. Missing credentials fail the suite rather than silently skipping it.

Six tests run on both desktop Chromium and mobile Chromium (Pixel 7):

- Pages fit 320px phone, 768px tablet and 1440px desktop widths without horizontal overflow.
- Signed-out access to Todos, Profile and onboarding redirects to login.
- Home → signup rejects mismatched passwords and links to recovery.
- Home → login → create/complete/reopen/delete a persisted task → onboarding → Profile → logout.
- Another signed-in user cannot see the first user's disposable task.
- Login → private file upload → reload → download (content verified) → delete.

Every test gets a fresh browser context. Disposable records have a unique UUID prefix and teardown removes only that test's tasks and files using the same RLS-limited account. Existing user data is preserved. The separate integration test verifies cross-user database writes and file access at the API boundary; the browser suite verifies visible flows.

Videos for every run, selected state screenshots and the HTML report live under `output/playwright/<UTC-run-date>/`. Failed tests also retain screenshots and traces. Historical runs are preserved locally and ignored by Git. Reports and traces may contain test-account details; keep them private.

Open a report using `npx playwright show-report output/playwright/<UTC-run-date>/report`. Set `E2E_BASE_URL` to test a deployed test app instead of starting the local server. That deployment must use the same dedicated Supabase test project and accounts. Do not target a production app with pilot data.

The GitHub workflow runs fast verification first, then the real integration and browser suites for pushes and same-repository PRs. Configure six repository secrets before enabling it: `E2E_SUPABASE_URL`, `E2E_SUPABASE_PUBLISHABLE_KEY`, `E2E_USER_ONE_EMAIL`, `E2E_USER_ONE_PASSWORD`, `E2E_USER_TWO_EMAIL`, and `E2E_USER_TWO_PASSWORD`. Fork PRs run only credential-free verification. CI stores private report/video artifacts for 14 days. No CI run is claimed until this project is connected to a GitHub repository and its secrets are configured.

Signup confirmation and password-reset email delivery remain separate inbox-assisted acceptance checks. The validation test does not prove email delivery or successful registration. Unsupported/oversize uploads and full WebKit/Firefox coverage remain follow-up coverage.

## Missing connection settings

`npm run test:e2e:unconfigured` starts a separate build on port 3208 with both public Supabase settings empty. It leaves `.env.local` untouched and checks desktop/mobile/320px error cards in Tasks, Files, Profile, login, signup, recovery, password update and onboarding. The homepage has no setup dashboard. This suite needs no accounts or database and runs with the credential-free CI job.

Because Next.js embeds public environment values at build time, restart development after changing keys and rebuild production after removing or restoring them. Removing only the database administration password does not disable the app; runtime uses the project URL and publishable key.

## Hosting setup and error prompts

The homepage and app shell show “Web hosting not available” when the app has neither a Vercel platform environment nor a linked project. Setup is detected through `VERCEL=1`, paired `VERCEL_PROJECT_ID`/`VERCEL_ORG_ID`, or a local `.vercel/project.json` with both IDs. These follow [Vercel's project-linking options](https://vercel.com/docs/cli/global-options) and [system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables). A project link does not prove a successful deployment or uptime.

Each error card includes a two-line repair prompt with a Copy prompt button. No credentials are embedded. The missing-settings browser suite checks prompt length and clipboard contents on desktop, mobile and 320px screens with explicit clipboard permission. If clipboard access is denied, the card tells the user to select and copy the text manually. `npm test` also checks hosting detection with absent, valid and malformed project links.

## Production deployment for the AI agent

Use `.env.local` for local development and `.env.production.local` for the production app. The production file is ignored by Git and excluded from deployment source uploads. It contains only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Do not copy the database password, administration keys or test-account credentials into it. These public settings are visible to app users by design.

1. Sign in to Vercel and link the intended account/project with `vercel link`. Use browser control if the user needs account creation or sign-in help.
2. Create `.env.production.local` with the two production Supabase connection settings. For this starter, local and deployed versions currently use the same dedicated soara-todo project.
3. Use computer control in the Vercel dashboard: open the linked project → Settings → Environment Variables. Manually copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from `.env.production.local`, select Production, and save each value. Never copy database passwords, administration keys or test-account credentials. Deploy or redeploy after saving so the build uses the updated settings.

   For repeat deployments, `npm run deploy:production` is also available. It uploads the same allowed settings through the CLI and deploys; the environment file itself is never uploaded.
4. Set Supabase's Site URL to the deployed origin and add exact onboarding, password-recovery and callback redirects while preserving needed local URLs.
5. Verify the app works using the E2E tests: `E2E_BASE_URL=https://soara-starter-app.vercel.app npx playwright test`. Use the local dedicated test accounts. Do not copy them to Vercel.

The current shared URL is https://soara-starter-app.vercel.app. Deployment is command-driven; editing the file alone does not publish it, and no GitHub automatic deployment pipeline is configured.

GitHub real-service checks are opt-in. Configure the six documented test secrets and set repository variable `E2E_ENABLED=true` to enable them. Credential-free checks run automatically.
