# M-Ploy deployment guide

M-Ploy is a Vite single-page app backed by Supabase. It can be deployed to
Vercel without any server-side provider key in Vercel.

## 1. Deploy the frontend to Vercel

Import this GitHub repository into Vercel and use the defaults:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Install command:** `npm install`

Add only the public Supabase values to Vercel:

```bash
VITE_SUPABASE_URL=https://nlfokrpapmzgazcwfgcp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable/anon key>
```

Never add Resend, Stripe, Paystack, OpenAI, reCAPTCHA, or Supabase service-role
credentials to Vercel. They stay in Supabase's encrypted integration settings.

In Supabase Auth, add the Vercel and production domains to **URL Configuration**
as allowed redirect URLs, including:

```text
https://go-mploy.com/auth
https://www.go-mploy.com/auth
https://<your-vercel-project>.vercel.app/auth
```

## 2. Deploy database and Edge Functions

```bash
supabase link --project-ref nlfokrpapmzgazcwfgcp
supabase db push
node deploy-edge-functions.js
```

The deployment script uses Supabase's server-side bundler (`--use-api`) and
deploys every checked-in function.

## 3. Required Supabase-only bootstrap secrets

These are infrastructure secrets, not provider credentials. Set them in
Supabase once; do not commit them or expose them in Vercel.

| Secret | Why it exists |
| --- | --- |
| `ADMIN_ACCESS_CODE`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Secure initial admin session |
| `EMPLOYER_ACCESS_CODE` | Server-side employer access verification |
| `SETTINGS_ENCRYPTION_KEY` | 32-byte base64 key used by Edge Functions to encrypt provider settings |
| `AUTH_EMAIL_HOOK_SECRET` | Shared secret for Supabase Auth's optional custom email hook |

Generate secure values locally, for example:

```bash
openssl rand -base64 32
supabase secrets set SETTINGS_ENCRYPTION_KEY="<generated value>"
supabase secrets set AUTH_EMAIL_HOOK_SECRET="<generated value>"
```

## 4. Configure providers in the admin dashboard

Sign in at `/auth` with the admin access code, then open **Admin Console →
Integrations**. The dashboard saves provider values through an admin-only Edge
Function; API keys are encrypted before database storage and are never returned
to the browser.

Configure the integrations you use:

- **Resend API key** and a verified **From address** — platform emails, job
  alerts, and broadcasts.
- **Stripe secret key** — Stripe checkout and billing portal.
- **Paystack secret key** — Paystack subscriptions.
- **reCAPTCHA secret key** — CAPTCHA verification.
- **OpenAI API key** and model — Career Coach and AI CV Review.
- **Public application URL** — email and payment redirect links.

Use **Send test** in the Resend card after verifying your sending domain in
Resend.

## 5. Optional: Supabase Auth emails through Resend

The app's own emails use the Resend API above. For Supabase confirmation,
password-recovery, and magic-link emails, either configure Resend SMTP in
**Supabase Dashboard → Authentication → SMTP**, or set up the included
`auth-email-hook` HTTP hook:

1. Deploy the function.
2. In **Authentication → Hooks**, set the Send Email hook URL to:
   `https://nlfokrpapmzgazcwfgcp.supabase.co/functions/v1/auth-email-hook`
3. Configure an `Authorization: Bearer <AUTH_EMAIL_HOOK_SECRET>` header.

The hook queues mail through the same Resend configuration managed in Admin →
Integrations.