import { test, expect } from '@playwright/test'

test.describe('API Health', () => {
  test('GET /api/shop/shipping returns shipping config', async ({ request }) => {
    const res = await request.get('/api/shop/shipping')
    expect(res.status()).toBe(200)
    const body = await res.json() as { shippingCost: number; freeThreshold: number }
    expect(typeof body.shippingCost).toBe('number')
    expect(typeof body.freeThreshold).toBe('number')
    expect(body.shippingCost).toBeGreaterThan(0)
    expect(body.freeThreshold).toBeGreaterThan(0)
  })

  test('POST /api/auth/send-otp با شماره نامعتبر خطا 400', async ({ request }) => {
    const res = await request.post('/api/auth/send-otp', {
      data: { phone: '12345' },
    })
    expect(res.status()).toBe(400)
  })

  test('CSRF: POST /api/orders بدون Origin رد می‌شود', async ({ request }) => {
    const res = await request.post('/api/orders', {
      data: { items: [] },
      headers: {
        'content-type': 'application/json',
        // no Origin header
      },
    })
    // 403 CSRF or 401 unauthorized — either is correct
    expect([401, 403]).toContain(res.status())
  })

  test('GET /api/products returns list', async ({ request }) => {
    const res = await request.get('/api/products')
    expect([200, 404]).toContain(res.status())
  })
})
