import { describe, it, expect } from 'vitest'
import { verifyOrigin } from './csrf'

function makeReq(method: string, headers: Record<string, string>): Request {
  return new Request('https://beewaz.ir/api/test', { method, headers })
}

describe('verifyOrigin', () => {
  it('allows safe GET requests without origin', () => {
    expect(verifyOrigin(makeReq('GET', { host: 'beewaz.ir' }))).toBe(true)
  })

  it('allows POST when Origin matches host', () => {
    expect(verifyOrigin(makeReq('POST', { host: 'beewaz.ir', origin: 'https://beewaz.ir' }))).toBe(true)
  })

  it('rejects POST when Origin differs from host', () => {
    expect(verifyOrigin(makeReq('POST', { host: 'beewaz.ir', origin: 'https://evil.com' }))).toBe(false)
  })

  it('falls back to Referer when Origin missing', () => {
    expect(verifyOrigin(makeReq('POST', { host: 'beewaz.ir', referer: 'https://beewaz.ir/checkout' }))).toBe(true)
  })

  it('rejects POST with no Origin and no Referer', () => {
    expect(verifyOrigin(makeReq('POST', { host: 'beewaz.ir' }))).toBe(false)
  })

  it('rejects when Referer host differs', () => {
    expect(verifyOrigin(makeReq('DELETE', { host: 'beewaz.ir', referer: 'https://evil.com/x' }))).toBe(false)
  })
})
