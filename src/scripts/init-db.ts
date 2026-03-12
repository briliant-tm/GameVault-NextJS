// Run this once to create tables: npx ts-node src/scripts/init-db.ts
// Or trigger via GET /api/init-db (for first deploy)

import { initializeDatabase } from '../lib/db'

async function main() {
  console.log('Initializing database...')
  await initializeDatabase()
  console.log('Database initialized successfully!')
  process.exit(0)
}

main().catch(err => {
  console.error('Failed to initialize database:', err)
  process.exit(1)
})
