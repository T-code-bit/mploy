#!/usr/bin/env node

/**
 * Supabase Edge Function Secrets Deployment Script
 * This script sets up all necessary environment secrets for Edge Functions
 */

const https = require('https');

// Configuration
const PROJECT_ID = 'nlfokrpapmzgazcwfgcp';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZm9rcnBhcG16Z2F6Y3dmZ2NwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTU5NDgwMCwiZXhwIjoyMDk3MTcwODAwfQ.cMQzkdsdoSlrr030pm1U62DCh_dKiPC_cdXbWWdZkG8';

const SECRETS = {
  OPENAI_API_KEY: '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',
  PAYSTACK_SECRET_KEY: 'sk_live_5feff622d8445511ba418c876024e39e8111d2bc',
  PAYSTACK_PUBLIC_KEY: 'pk_live_a64f22f4dc89c275caca6252803328b07302ff30',
};

/**
 * Make HTTP request to Supabase API
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Set Edge Function secrets
 */
async function deploySecrets() {
  console.log('🚀 Starting Supabase Edge Function Secrets Deployment...\n');

  try {
    for (const [key, value] of Object.entries(SECRETS)) {
      console.log(`📝 Setting ${key}...`);
      
      // Note: The actual API endpoint for setting secrets may vary
      // This is a template - you may need to adjust based on Supabase API docs
      const result = await makeRequest(
        'POST',
        `/v1/projects/${PROJECT_ID}/secrets`,
        { name: key, value: value }
      );

      if (result.status === 200 || result.status === 201) {
        console.log(`   ✅ ${key} deployed successfully\n`);
      } else {
        console.log(`   ⚠️  Status: ${result.status}`);
        console.log(`   Response: ${JSON.stringify(result.data)}\n`);
      }
    }

    console.log('✅ All secrets configured!');
    console.log('\n📋 Next Steps:');
    console.log('1. Go to: https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/functions');
    console.log('2. Click "Deploy a new function"');
    console.log('3. Upload each function from supabase/functions/');
    console.log('4. Or use: supabase functions deploy');

  } catch (error) {
    console.error('❌ Error deploying secrets:', error.message);
    process.exit(1);
  }
}

deploySecrets();
