#!/usr/bin/env node
/**
 * Deploy Secrets to Supabase Edge Functions
 * Usage: node deploy-edge-functions.js
 */

const fs = require('fs');
const path = require('path');

// Credentials
const config = {
  projectId: 'nlfokrpapmzgazcwfgcp',
  supabaseUrl: 'https://nlfokrpapmzgazcwfgcp.supabase.co',
  secrets: {
    OPENAI_API_KEY: 'sk-proj-***', // Real key in .env.secrets
    PAYSTACK_SECRET_KEY: 'sk_live_***', // Real key in .env.secrets
    PAYSTACK_PUBLIC_KEY: 'pk_live_***', // Real key in .env.secrets
  },
};

console.log('📋 Supabase Edge Functions Deployment Setup\n');
console.log('========================================\n');

console.log('✅ Configuration loaded:\n');
console.log(`   Project ID: ${config.projectId}`);
console.log(`   Supabase URL: ${config.supabaseUrl}`);
console.log(`   Secrets configured: ${Object.keys(config.secrets).length}\n`);

console.log('📝 Secrets to deploy:\n');
Object.keys(config.secrets).forEach((key, i) => {
  const value = config.secrets[key];
  const preview = value.substring(0, 20) + '...' + value.substring(value.length - 10);
  console.log(`   ${i + 1}. ${key}`);
  console.log(`      Value: ${preview}\n`);
});

console.log('========================================\n');
console.log('🚀 NEXT STEPS - Deploy to Supabase:\n');

console.log('1️⃣  Go to Supabase Dashboard Secrets:\n');
console.log('   https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/settings/secrets\n');

console.log('2️⃣  Add each secret:\n');
Object.keys(config.secrets).forEach((key) => {
  console.log(`   Name: ${key}`);
  console.log(`   Value: ${config.secrets[key].substring(0, 30)}...`);
  console.log();
});

console.log('3️⃣  Deploy Edge Functions:\n');
console.log('   Option A (Dashboard): https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/functions');
console.log('   Option B (CLI): supabase functions deploy\n');

console.log('4️⃣  Verify Functions Are Live:\n');
console.log(`   curl -X GET '${config.supabaseUrl}/functions/v1/career-coach' \\`);
console.log('     -H "Authorization: Bearer ANON_KEY"');

console.log('\n========================================');
console.log('✨ Once deployed, all features will work:');
console.log('   ✅ Admin authentication');
console.log('   ✅ Employer job publishing');
console.log('   ✅ Chatbot (career-coach)');
console.log('   ✅ Payment processing (Paystack)');
console.log('   ✅ Subscription validation');
console.log('========================================\n');

// Save to JSON for reference
const deploymentInfo = {
  timestamp: new Date().toISOString(),
  projectId: config.projectId,
  supabaseUrl: config.supabaseUrl,
  secretsCount: Object.keys(config.secrets).length,
  functions: [
    'career-coach',
    'notify-new-job',
    'paystack-create-subscription',
    'paystack-check-subscription',
    'admin-access-login'
  ],
  dashboardLinks: {
    secrets: 'https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/settings/secrets',
    functions: 'https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/functions',
    logs: 'https://app.supabase.com/project/nlfokrpapmzgazcwfgcp/logs'
  }
};

fs.writeFileSync(
  path.join(__dirname, 'deployment-info.json'),
  JSON.stringify(deploymentInfo, null, 2)
);

console.log('📄 Deployment info saved to: deployment-info.json');
