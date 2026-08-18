# Supabase Edge Functions Deployment Guide

## Quick Setup (5 minutes)

### Step 1: Set Secrets in Supabase Dashboard

Go to: https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/settings/secrets

Click "New Secret" and add these:

```
OPENAI_API_KEY = <your-openai-api-key>

PAYSTACK_SECRET_KEY = <your-paystack-secret-key>

PAYSTACK_PUBLIC_KEY = <your-paystack-public-key>
```

### Step 2: Deploy Edge Functions

**Option A: Using Supabase Dashboard (Easiest)**

1. Go to: https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/functions
2. Click "Create a new function" or "Deploy"
3. Select each function from your local `supabase/functions/` folder:
   - career-coach
   - notify-new-job
   - paystack-create-subscription
   - paystack-check-subscription
   - admin-access-login

**Option B: Using Supabase CLI (If Installed)**

```bash
# Set authentication token
$env:SUPABASE_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZm9rcnBhcG16Z2F6Y3dmZ2NwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTU5NDgwMCwiZXhwIjoyMDk3MTcwODAwfQ.cMQzkdsdoSlrr030pm1U62DCh_dKiPC_cdXbWWdZkG8'

# Link to project
supabase link --project-ref nlfokrpapmzgazcwfgcp

# Deploy all functions
supabase functions deploy
```

### Step 3: Verify Deployment

After deploying, test in the browser console:

```javascript
// Test admin auth
await fetch('https://nlfokrpapmzgazcwfgcp.supabase.co/functions/v1/admin-access-login', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ code: '2013' })
})
.then(r => r.json())
.then(console.log);
```

---

## Functions Being Deployed

### 1. **career-coach** - AI Chatbot
- **Purpose:** Responds to user questions using OpenAI
- **Requires:** OPENAI_API_KEY
- **Used by:** ChatBot component in-app

### 2. **notify-new-job** - Job Notifications
- **Purpose:** Sends email notifications when new jobs are posted
- **Requires:** SMTP setup (optional)
- **Used by:** Employer Portal (optional - non-blocking)

### 3. **paystack-create-subscription** - Payment Checkout
- **Purpose:** Creates Paystack checkout session for payments
- **Requires:** PAYSTACK_PUBLIC_KEY, PAYSTACK_SECRET_KEY
- **Used by:** Pricing section, subscription upgrades

### 4. **paystack-check-subscription** - Subscription Validation
- **Purpose:** Checks if user has active subscription
- **Requires:** PAYSTACK_SECRET_KEY
- **Used by:** AuthContext, Dashboard

### 5. **admin-access-login** - Admin Authentication
- **Purpose:** Validates admin access code and creates admin session
- **Requires:** Service role key (automatic)
- **Used by:** Admin login form

---

## Credentials Provided

✅ **Paystack:**
- Public Key: `pk_live_***` (Check .env.secrets locally)
- Secret Key: `sk_live_***` (Check .env.secrets locally)

✅ **OpenAI:**
- API Key: `sk-proj-***` (Check .env.secrets locally)

✅ **Supabase Service Role:**
- Key: (Stored securely in .env.secrets)

---

## Troubleshooting

**Q: Functions not working after deployment?**
- Check secrets are set correctly in Supabase dashboard
- Verify function URLs are correct
- Check Supabase logs: https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/logs

**Q: Getting authentication errors?**
- Ensure anon key is used in client-side code
- Service role key is for backend only

**Q: Payment/Chatbot still not working?**
- Wait 2-3 minutes after deployment for functions to be live
- Check function logs for errors
- Verify API keys are correct

---

## Security Notes

⚠️ **Important:**
- Keep these secrets secure
- Don't commit `.env.secrets` to git
- Rotate keys periodically
- Use environment variables in production

✅ **Already Done:**
- Secrets are stored in Supabase (not in code)
- Functions use SECURITY DEFINER where needed
- CORS is configured for specific origin
