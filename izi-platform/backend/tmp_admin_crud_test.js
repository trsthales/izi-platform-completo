import http from 'http'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

const makeRequest = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    if (token) options.headers['Authorization'] = `Bearer ${token}`

    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }) }
        catch (e) { resolve({ status: res.statusCode, body }) }
      })
    })

    req.on('error', (err) => reject(err))
    if (data) req.write(JSON.stringify(data))
    req.end()
  })
}

;(async () => {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  })

  try {
    const email = `admin_crud_test_${Date.now()}@example.com`
    const password = 'Senha2025'
    console.log('Registering', email)
    await makeRequest('POST', '/api/auth/register', { name: 'Admin CRUD', email, password })

    const login = await makeRequest('POST', '/api/auth/login', { email, password })
    const token = login.body?.data?.token
    const userId = login.body?.data?.user?.id

    await pool.query('UPDATE users SET is_admin = true WHERE id = $1', [userId])

    // Create course
    const courseData = { title: 'CRUD Course', description: 'Test CRUD', category: 'programming', link: 'https://example.com', is_published: true }
    const create = await makeRequest('POST', '/api/courses', courseData, token)
    console.log('Create', create.status, create.body)

    const courseId = create.body?.data?.course?.id

    // Update course
    const updateData = { title: 'CRUD Course Updated', price: 19.99, link: 'https://example.com/updated' }
    const update = await makeRequest('PUT', `/api/courses/${courseId}`, updateData, token)
    console.log('Update', update.status, update.body)

    // Delete course
    const del = await makeRequest('DELETE', `/api/courses/${courseId}`, null, token)
    console.log('Delete', del.status, del.body)

    await pool.end()
    process.exit(0)
  } catch (err) {
    console.error('Error in CRUD test', err)
    await pool.end()
    process.exit(1)
  }
})()

