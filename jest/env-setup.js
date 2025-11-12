// Load test-specific environment variables
require('dotenv').config({ path: '.env.test' })

// Fallback to .env.local if .env.test doesn't exist
if (!process.env.MONGODB_URI) {
  require('dotenv').config({ path: '.env.local' })
}

console.log('🔧 Test environment loaded')

