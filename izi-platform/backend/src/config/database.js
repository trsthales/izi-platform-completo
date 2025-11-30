import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'izi_platform',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect()
    console.log('✅ Database connected successfully')
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time')
    console.log('📅 Database time:', result.rows[0].current_time)
    
    client.release()
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('📊 Query executed', { text: text.substring(0, 50), duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error('❌ Query failed', { text: text.substring(0, 50), error: error.message })
    throw error
  }
}

// Transaction helper
export const transaction = async (callback) => {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Connection pool getter
export const getPool = () => pool

export default pool