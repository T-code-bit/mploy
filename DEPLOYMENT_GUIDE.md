# Supabase Edge Function deployment

This project uses Supabase for authentication, database access, and Edge
Functions. Do not commit credentials or deploy them from source files.

## Deploy functions

1. Create a Supabase personal access token and expose it only in your shell:

   ```bash
   export SUPABASE_ACCESS_TOKEN="..."
   ```

2. Deploy every checked-in function:

   ```bash
   node deploy-edge-functions.js
   ```

   The script uses Supabase's server-side bundler (`--use-api`), which avoids
   local Docker and Deno import resolution issues.

## Required secrets

Set secrets in the Supabase dashboard or with `supabase secrets set`. Never
place their values in this repository.

| Feature | Required secret |
| --- | --- |
| Admin sign-in | `ADMIN_ACCESS_CODE`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| Employer account access | `EMPLOYER_ACCESS_CODE` |
| Paystack subscriptions | `PAYSTACK_SECRET_KEY` |
| Stripe subscriptions (if used) | `STRIPE_SECRET_KEY` |
| reCAPTCHA verification | `RECAPTCHA_SECRET_KEY` |

The legacy Lovable-dependent AI and mail functions are intentionally not
configured by this guide. They will return a controlled configuration error
until they are replaced with a provider you choose.

## Verify deployment

Check the function inventory:

```bash
supabase functions list --project-ref nlfokrpapmzgazcwfgcp
```

For a safe endpoint check, send an `OPTIONS` request. A deployed endpoint
returns a non-404 response:

```bash
curl -i -X OPTIONS \
  https://nlfokrpapmzgazcwfgcp.supabase.co/functions/v1/admin-access-login
```

Use real test accounts for sign-in, employer access, payment, and CAPTCHA
flows. Do not test payment endpoints with production customer data.