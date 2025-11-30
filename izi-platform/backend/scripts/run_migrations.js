import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'
import dotenv from 'dotenv'

// Load env from backend/.env
dotenv.config({ path: path.resolve(process.cwd(), './.env') })

const MIGRATIONS_DIR = path.resolve(process.cwd(), '../database/migrations')

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'izi_platform',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432
})

const run = async () => {
  try {
    console.log('Migrations directory:', MIGRATIONS_DIR)

    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.error('Migrations directory not found:', MIGRATIONS_DIR)
      process.exit(1)
    }

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort()

    if (files.length === 0) {
      console.log('No migration files found')
      process.exit(0)
    }

    const client = await pool.connect()
    try {
      for (const file of files) {
        const filePath = path.join(MIGRATIONS_DIR, file)
        console.log('Applying migration:', file)
        const sql = fs.readFileSync(filePath, 'utf8')
        // Run the SQL directly; files should be idempotent or use checks
        await client.query(sql)
        console.log('Applied:', file)
      }
    } finally {
      client.release()
    }

    console.log('All migrations applied successfully')
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error.message)
    await pool.end()
    process.exit(1)
  }
}

run()

