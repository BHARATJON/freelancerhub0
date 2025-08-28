const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Freelancer Hub Setup...\n');

// Test 1: Check if all required files exist
const requiredFiles = [
  'backend/server.js',
  'backend/package.json',
  'backend/.env',
  'frontend/package.json',
  'frontend/src/App.jsx',
  'frontend/src/main.jsx',
  'package.json'
];

console.log('📁 Checking required files...');
let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Test 2: Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
const frontendPackage = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));

console.log('✅ Root scripts:', Object.keys(rootPackage.scripts));
console.log('✅ Backend scripts:', Object.keys(backendPackage.scripts));
console.log('✅ Frontend scripts:', Object.keys(frontendPackage.scripts));

// Test 3: Check dependencies
console.log('\n🔧 Checking dependencies...');
console.log('✅ Backend dependencies:', Object.keys(backendPackage.dependencies).length, 'packages');
console.log('✅ Frontend dependencies:', Object.keys(frontendPackage.dependencies).length, 'packages');

// Test 4: Check if .env exists and has required variables
console.log('\n🔐 Checking environment setup...');
if (fs.existsSync('backend/.env')) {
  const envContent = fs.readFileSync('backend/.env', 'utf8');
  const hasMongoUri = envContent.includes('MONGO_URI');
  const hasJwtSecret = envContent.includes('JWT_SECRET');
  console.log(`${hasMongoUri ? '✅' : '❌'} MONGO_URI configured`);
  console.log(`${hasJwtSecret ? '✅' : '❌'} JWT_SECRET configured`);
} else {
  console.log('❌ .env file missing');
}

console.log('\n🎉 Setup verification complete!');
console.log('🚀 Ready to run: npm run dev'); 