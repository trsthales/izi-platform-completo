// Utility to mask sensitive fields in objects before logging
const DEFAULT_SENSITIVE_KEYS = ['password', 'pass', 'pwd', 'token', 'access_token', 'refresh_token', 'authorization', 'auth', 'secret', 'ssn', 'credit_card', 'card_number']

export function maskObject(input, sensitiveKeys = DEFAULT_SENSITIVE_KEYS) {
  if (input == null) return input
  const seen = new WeakSet()

  function _mask(value) {
    if (value === null || value === undefined) return value
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
    if (Array.isArray(value)) return value.map(v => _mask(v))
    if (typeof value === 'object') {
      if (seen.has(value)) return '[Circular]'
      seen.add(value)
      const out = {}
      for (const [k, v] of Object.entries(value)) {
        if (sensitiveKeys.some(sk => k.toLowerCase().includes(sk.toLowerCase()))) {
          // mask strings and numbers
          out[k] = typeof v === 'string' ? `${v.slice(0, 4) ? v.slice(0,4) : ''}****` : '****'
        } else {
          out[k] = _mask(v)
        }
      }
      return out
    }
    return value
  }

  return _mask(input)
}

export default maskObject

