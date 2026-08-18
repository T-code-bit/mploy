# ⚡ MANUAL DEPLOYMENT GUIDE
## Deploy Edge Functions in 5 Minutes

### Step 1: Set Environment Secrets (2 minutes)

1. Open: https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/settings/secrets

2. Click **"New Secret"** and add each one:

**Secret #1: OPENAI_API_KEY**
```
Name: OPENAI_API_KEY
Value: <your-openai-api-key-from-.env.secrets>
```

**Secret #2: PAYSTACK_SECRET_KEY**
```
Name: PAYSTACK_SECRET_KEY
Value: <your-paystack-secret-from-.env.secrets>
```

**Secret #3: PAYSTACK_PUBLIC_KEY**
```
Name: PAYSTACK_PUBLIC_KEY  
Value: <your-paystack-public-from-.env.secrets>
```

✅ After adding, you should see all 3 secrets listed.

---

### Step 2: Deploy Edge Functions (3 minutes)

1. Open: https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/functions

2. Click **"Create a new function"** or **"Deploy new function"**

3. For each function below, upload/paste the code from your local folder:

#### Function 1: career-coach
- **Location:** `supabase/functions/career-coach/index.ts`
- **Name:** `career-coach`
- **Copy & paste** the entire index.ts file
- Click **"Deploy"**

#### Function 2: notify-new-job
- **Location:** `supabase/functions/notify-new-job/index.ts`
- **Name:** `notify-new-job`
- Click **"Deploy"**

#### Function 3: paystack-create-subscription
- **Location:** `supabase/functions/paystack-create-subscription/index.ts`
- **Name:** `paystack-create-subscription`
- Click **"Deploy"**

#### Function 4: paystack-check-subscription
- **Location:** `supabase/functions/paystack-check-subscription/index.ts`
- **Name:** `paystack-check-subscription`
- Click **"Deploy"**

#### Function 5: admin-access-login
- **Location:** `supabase/functions/admin-access-login/index.ts`
- **Name:** `admin-access-login`
- Click **"Deploy"**

✅ After deploying all 5, they should appear in the functions list with green checkmarks.

---

### Step 3: Verify Deployment (Optional but Recommended)

1. Go to: https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/functions

2. Click each function to see:
   - ✅ Deployment status: "Active"
   - ✅ Logs section (no errors)
   - ✅ Environment variables are loaded

3. Test in your application:
   - **Admin Login** - Try code `2013`
   - **Employer Portal** - Post a new job
   - **Chatbot** - Open career coach
   - **Pricing** - Try to upgrade subscription

---

### Troubleshooting

**Functions show as "Inactive"?**
- Wait 30 seconds for deployment to complete
- Check logs for errors
- Verify all secrets are set correctly

**Getting 404 errors?**
- Ensure function names match exactly
- Check function URLs in browser developer tools
- Verify project ID is correct

**Secrets not working?**
- Go back to Settings > Secrets
- Verify each secret is set
- Re-deploy functions after adding secrets

**Still having issues?**
- Check logs: https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/logs
- Click each failed function to see detailed error message
- Copy error message for debugging

---

## What Each Function Does

| Function | Purpose | Uses |
|----------|---------|------|
| **career-coach** | AI chatbot responses | OpenAI API |
| **notify-new-job** | Email notifications | SMTP (optional) |
| **paystack-create-subscription** | Payment checkout | Paystack API |
| **paystack-check-subscription** | Verify subscriptions | Paystack API |
| **admin-access-login** | Admin authentication | Service Role Key |

---

## After Deployment ✨

Your app will immediately have:

✅ **Admin Console Working**
- Login with access code: `2013`
- View all platform data
- Manage jobs, users, subscriptions

✅ **Employer Features Working**
- Publish job listings
- View applications
- Send notifications

✅ **Payment Processing Working**
- Users can upgrade subscriptions
- Paystack integration active
- Automatic subscription validation

✅ **AI Chatbot Working**
- Career advice
- Interview tips
- CV guidance
- General life advice

---

## Quick Links

- **Supabase Project:** https://app.supabase.com/project/nlfokrpapmzgazcwfgcp
- **Functions Dashboard:** https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/functions
- **Settings/Secrets:** https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/settings/secrets
- **Logs:** https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/logs
- **API Keys:** https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/settings/api

---

**Questions?** Check the logs or review DEPLOYMENT_GUIDE.md for more details.
