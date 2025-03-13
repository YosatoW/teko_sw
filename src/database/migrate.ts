import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db } from '../database'
import { logger } from '../services/logger'

// Update timestamps for existing records
const updateTimestamps = async () => {
  await db.execute(sql`
    UPDATE posts 
    SET created_at = NOW() 
    WHERE created_at IS NULL;
    
    UPDATE comments 
    SET created_at = NOW() 
    WHERE created_at IS NULL;
  `)
}

// Run migrations
const main = async () => {
  try {
    await migrate(db, { migrationsFolder: 'drizzle' })
    await updateTimestamps()
    logger.info('Migrations completed')
  } catch (error) {
    console.error('Error running migrations:', error)
    process.exit(1)
  }
}

main()
