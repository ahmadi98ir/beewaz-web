import { test, expect } from '@playwright/test'

test.describe('تکمیل خرید', () => {
  test('سبد خالی در checkout نمایش داده می‌شود', async ({ page }) => {
    // clear cart
    await page.goto('/')
    await page.evaluate(() => {
      const key = Object.keys(localStorage).find(k => k.includes('cart'))
      if (key) localStorage.removeItem(key)
    })

    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    // should show empty cart message or redirect
    const isEmpty = await page.locator('text=خالی').or(page.locator('text=محصولی')).count()
    const isRedirected = page.url().includes('/cart') || page.url().includes('/shop')
    expect(isEmpty > 0 || isRedirected).toBe(true)
  })

  test('صفحه checkout با سبد پر باز می‌شود', async ({ page }) => {
    // seed a cart item via localStorage
    await page.goto('/')
    await page.evaluate(() => {
      const cart = {
        state: {
          items: [{
            id: 'test-product-id',
            slug: 'test-product',
            categorySlug: 'test',
            nameFa: 'محصول تست',
            sku: 'TEST-001',
            price: 5000000,
            quantity: 1,
            placeholderFrom: '#f0f0f0',
            placeholderTo: '#e0e0e0',
          }],
          isOpen: false,
        },
        version: 0,
      }
      localStorage.setItem('beewaz-cart', JSON.stringify(cart))
    })

    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    // should show checkout form or login redirect
    const hasForm = await page.locator('form').count()
    const hasLoginRedirect = page.url().includes('/login')
    expect(hasForm > 0 || hasLoginRedirect).toBe(true)
  })
})
