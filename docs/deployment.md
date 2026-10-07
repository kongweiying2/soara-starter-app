# Deployment checklist

1. Create a GitHub repository in your own account. Ask your coding assistant to initialize Git here, commit the template and push to that repository. No repository has been created automatically.
2. In Vercel, choose Add New Project and import the repository. Keep the detected Next.js framework and standard build settings.
3. Use computer control to open Vercel Project Settings → Environment Variables and manually copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the ignored `.env.production.local` file. Select Production and save each value before deploying. Do not copy database passwords, service-role keys or test credentials.
4. Apply the workspace migration to the Supabase project used by this deployment.
5. Deploy and note the final HTTPS origin. In Supabase Authentication → URL Configuration, set Site URL to that origin and add `/onboarding` and `/auth/update-password` on that origin as allowed authentication redirect URLs. Keep localhost redirects for development. Use a separate Supabase project for preview/testing if preview deployments must not write production data.
6. Default Supabase emails use `/auth/callback` to exchange the confirmation code for a server session. Allow `/auth/callback?next=/onboarding` and `/auth/callback?next=/auth/update-password` on your app origin. Custom SMTP is needed for unrestricted delivery and custom templates. If using custom token-hash templates through `/auth/confirm`, for Confirm signup use:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/onboarding">Confirm your email</a>
```

For Reset password, use:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password">Reset your password</a>
```

These links use the configured Site URL. For another environment, configure the matching Supabase project accordingly. Production email delivery also needs an appropriate email provider/SMTP configuration; do not assume Supabase's development mail service is sufficient for real users.

7. Verify signup, email confirmation, login, task persistence, upload/download/delete, logout, and password recovery on the deployed URL. Try two accounts and verify data separation.
8. Share the URL. Users create an account inside your app, not in Vercel or Supabase.

Database migrations and Git commits are separate. Vercel deploys app code; it does not automatically apply this SQL migration. Introduce later schema changes as new migration files and review their data impact before applying them.
