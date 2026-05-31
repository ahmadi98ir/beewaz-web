import { describe, it, expect } from 'vitest'
import { verifyOrigin } from './csrf'

function makeReq(method: string, headers: Record<string, string>): Request {
  return new Request('https://bz360.ir/api/test', { method, headers })
}

describe('verifyOrigin', () => {
  it('allows safe GET requests without origin', () => {
    expect(verifyOrigin(makeReq('GET', { host: 'bz360.ir' }))).toBe(true)
  })

  it('allows POST when Origin matches host', () => {
    expect(verifyOrigin(makeReq('POST', { host: 'bz360.ir', origin: 'https://bz360.ir' }))).toBe(true)
  })

  it('rejects POST when Origin differs from host', () => {
    expect(verifyOrigin(makeReq('POST', { host: 'bz360.ir', origin: 'https://evil.com' }))).toBe(false)
  })

  it('falls back to Referer when Origin missing', () => {
    expect(verifyOrigin(makeReq('POST', { host: 'bz360.ir', referer: 'https://bz360.ir/checkout' }))).toBe(true)
  })

  it('rejects POST with no Origin and no Referer', () => {
    expect(verifyOrigin(makeReq('POST', { host: 'bz360.ir' }))).toBe(false)
  })

  it('rejects when Referer host differs', () => {
    expect(verifyOrigin(makeReq('DELETE', { host: 'bz360.ir', referer: 'https://evil.com/x' }))).toBe(false)
  })
})
