#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testEmailSafety() {
  console.log('🧪 Testing Email Safety and Unsubscribe Flow');
  console.log('==========================================');

  // Test 1: Send unsubscribe request
  console.log('\n1. Testing unsubscribe request...');
  try {
    const response = await fetch(`${BASE_URL}/api/email/unsubscribe/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        workspaceId: 'test-workspace',
        workspaceName: 'Test Workspace'
      })
    });

    const result = await response.json();
    console.log('✅ Unsubscribe request:', result.ok ? 'SUCCESS' : 'FAILED');
    console.log('   Response:', result);
  } catch (error) {
    console.log('❌ Unsubscribe request failed:', error.message);
  }

  // Test 2: Check if suppressions file was created
  console.log('\n2. Checking suppressions file...');
  try {
    const suppressionsPath = join(process.cwd(), 'var', 'suppressions.json');
    const data = await fs.readFile(suppressionsPath, 'utf-8');
    const suppressions = JSON.parse(data);
    console.log('✅ Suppressions file exists');
    console.log('   Total suppressions:', suppressions.emails?.length || 0);
    console.log('   Emails:', suppressions.emails || []);
  } catch (error) {
    console.log('❌ Suppressions file not found or invalid:', error.message);
  }

  // Test 3: Test email safety policies
  console.log('\n3. Testing email safety policies...');
  
  const testEmails = [
    'test@example.com',      // Should be allowed in dev
    'noreply@example.com',   // Should be blocked (role account)
    'test@gmail.com',        // Should be blocked (personal email pattern)
    'spam@example.com',      // Should be blocked (spam pattern)
    'valid@yourdomain.com'   // Should be allowed (matches ALLOW_DEV_EMAILS)
  ];

  for (const email of testEmails) {
    try {
      const response = await fetch(`${BASE_URL}/api/debug/email-safety`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      console.log(`   ${email}: ${result.allowed ? '✅ ALLOWED' : '❌ BLOCKED'} (${result.reason})`);
    } catch (error) {
      console.log(`   ${email}: ❌ ERROR - ${error.message}`);
    }
  }

  // Test 4: Test sending to suppressed email
  console.log('\n4. Testing sending to suppressed email...');
  try {
    const response = await fetch(`${BASE_URL}/api/debug/send-test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'test@example.com', // This should be suppressed if unsubscribe worked
        subject: 'Test Email',
        html: '<p>This is a test email</p>',
        workspaceId: 'test-workspace'
      })
    });

    const result = await response.json();
    console.log('✅ Test email send:', result.ok ? 'SUCCESS' : 'FAILED');
    console.log('   Response:', result);
  } catch (error) {
    console.log('❌ Test email send failed:', error.message);
  }

  console.log('\n🎉 Email safety testing complete!');
}

testEmailSafety().catch(console.error);
