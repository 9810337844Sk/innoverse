#!/usr/bin/env node

/**
 * PhotoFly Setup Verification Script
 * 
 * Checks if all required environment variables are configured
 * Run this before starting the application
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile(filePath, requiredVars, serviceName) {
  log(`\n🔍 Checking ${serviceName}...`, 'cyan');
  
  if (!fs.existsSync(filePath)) {
    log(`❌ ${filePath} not found!`, 'red');
    log(`   Copy from .env.example: cp ${filePath}.example ${filePath}`, 'yellow');
    return false;
  }

  const envContent = fs.readFileSync(filePath, 'utf8');
  const lines = envContent.split('\n');
  const envVars = {};

  // Parse env file
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  let allValid = true;
  const missing = [];
  const placeholder = [];

  requiredVars.forEach(varName => {
    const value = envVars[varName];
    
    if (!value) {
      missing.push(varName);
      allValid = false;
    } else if (
      value.includes('your_') || 
      value.includes('your-') ||
      value.includes('change-me') ||
      value.includes('replace_') ||
      value.includes('generate_')
    ) {
      placeholder.push(varName);
      allValid = false;
    }
  });

  if (missing.length > 0) {
    log(`❌ Missing variables:`, 'red');
    missing.forEach(v => log(`   - ${v}`, 'red'));
  }

  if (placeholder.length > 0) {
    log(`⚠️  Variables with placeholder values:`, 'yellow');
    placeholder.forEach(v => log(`   - ${v} = ${envVars[v]}`, 'yellow'));
  }

  if (allValid) {
    log(`✅ ${serviceName} configuration looks good!`, 'green');
  }

  return allValid;
}

function checkGoogleRedirectURI(envPath) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  let appUrl = '';
  let redirectUri = '';

  lines.forEach(line => {
    if (line.includes('NEXT_PUBLIC_APP_URL=')) {
      appUrl = line.split('=')[1]?.trim();
    }
    if (line.includes('GOOGLE_REDIRECT_URI=')) {
      redirectUri = line.split('=')[1]?.trim();
    }
  });

  if (appUrl && redirectUri) {
    const expectedRedirect = `${appUrl}/api/drive/callback`;
    if (redirectUri !== expectedRedirect) {
      log(`\n⚠️  Google Redirect URI mismatch:`, 'yellow');
      log(`   Expected: ${expectedRedirect}`, 'yellow');
      log(`   Got:      ${redirectUri}`, 'yellow');
    }
  }
}

function checkInternalSecret() {
  const frontendEnv = path.join(__dirname, 'frontend', '.env.local');
  const aiEnv = path.join(__dirname, 'ai-service', '.env');

  if (!fs.existsSync(frontendEnv) || !fs.existsSync(aiEnv)) {
    return;
  }

  const getFrontendSecret = () => {
    const content = fs.readFileSync(frontendEnv, 'utf8');
    const match = content.match(/INTERNAL_SECRET=(.+)/);
    return match ? match[1].trim() : null;
  };

  const getAiSecret = () => {
    const content = fs.readFileSync(aiEnv, 'utf8');
    const match = content.match(/INTERNAL_SECRET=(.+)/);
    return match ? match[1].trim() : null;
  };

  const frontendSecret = getFrontendSecret();
  const aiSecret = getAiSecret();

  if (frontendSecret && aiSecret && frontendSecret !== aiSecret) {
    log(`\n❌ INTERNAL_SECRET mismatch!`, 'red');
    log(`   Frontend: ${frontendSecret}`, 'red');
    log(`   AI Service: ${aiSecret}`, 'red');
    log(`   These MUST be identical!`, 'yellow');
  } else if (frontendSecret === aiSecret) {
    log(`\n✅ INTERNAL_SECRET matches in both services`, 'green');
  }
}

function detectEnvironment(envPath) {
  if (!fs.existsSync(envPath)) return 'unknown';
  
  const content = fs.readFileSync(envPath, 'utf8');
  
  if (content.includes('localhost')) {
    return 'localhost';
  } else if (content.includes('vercel.app') || content.includes('railway.app')) {
    return 'production';
  }
  return 'unknown';
}

// Main execution
log('\n🚀 PhotoFly Setup Verification\n', 'blue');

const frontendEnv = path.join(__dirname, 'frontend', '.env.local');
const aiEnv = path.join(__dirname, 'ai-service', '.env');

// Required variables
const frontendRequired = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_AI_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'AUTH_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'INTERNAL_SECRET',
];

const aiRequired = [
  'APP_URL',
  'INTERNAL_SECRET',
];

// Check environment
const environment = detectEnvironment(frontendEnv);
if (environment !== 'unknown') {
  log(`🌍 Detected environment: ${environment.toUpperCase()}`, 'cyan');
}

// Run checks
const frontendValid = checkEnvFile(frontendEnv, frontendRequired, 'Frontend (.env.local)');
const aiValid = checkEnvFile(aiEnv, aiRequired, 'AI Service (.env)');

// Additional checks
if (fs.existsSync(frontendEnv)) {
  checkGoogleRedirectURI(frontendEnv);
}

checkInternalSecret();

// Final summary
log('\n' + '='.repeat(60), 'cyan');
if (frontendValid && aiValid) {
  log('✅ All checks passed! You can start the application.', 'green');
  log('\nTo start:', 'cyan');
  log('  Frontend:   cd frontend && npm run dev', 'cyan');
  log('  AI Service: cd ai-service && uvicorn main:app --reload', 'cyan');
} else {
  log('❌ Some checks failed. Please fix the issues above.', 'red');
  log('\nRefer to:', 'yellow');
  log('  - SETUP_GUIDE.md for complete setup instructions', 'yellow');
  log('  - ENV_REFERENCE.md for environment variable reference', 'yellow');
}
log('='.repeat(60) + '\n', 'cyan');
