import http from 'http'
import { promisify } from 'util'

const request = (method, path, data=null, token=null) => new Promise((resolve,reject)=>{
  const options = { hostname: 'localhost', port: 5000, path, method, headers: { 'Content-Type':'application/json' } }
  if (token) options.headers['Authorization'] = `Bearer ${token}`
  const req = http.request(options, res => {
    let b=''
    res.on('data', c => b+=c)
    res.on('end', ()=>resolve({ status: res.statusCode, body: b }))
  })
  req.on('error', reject)
  if (data) req.write(JSON.stringify(data))
  req.end()
})

;(async ()=>{
  try {
    console.log('Starting logging smoke test')
    // register
    const email = `smoketest+${Date.now()}@example.com`
    const password='Senha2025'
    console.log('Registering', email)
    const reg = await request('POST','/api/auth/register',{ name: 'Smoke Test', email, password })
    console.log('Reg status', reg.status)

    // login
    const login = await request('POST','/api/auth/login',{ email, password })
    console.log('Login status', login.status)
    const parsed = JSON.parse(login.body || '{}')
    const token = parsed?.data?.token
    if (!token) throw new Error('No token')

    // create course (as admin we need to promote - this requires DB access)
    console.log('Smoke test acquired token (will not create course since no admin)')

    console.log('Smoke test finished - check logs for masked bodies (password should be masked).')
    process.exit(0)
  } catch (err) {
    console.error('Smoke test error', err)
    process.exit(1)
  }
})()

