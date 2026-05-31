import { test, expect } from '@playwright/test'

test.describe('صفحه اصلی', () => {
  test('بارگذاری صفحه اصلی', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/بیواز/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('هدر سایت نمایش داده می‌شود', async ({ page }) => {
    await page.goto('/')
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('دکمه سبد خرید در هدر وجود دارد', async ({ page }) => {
    await page.goto('/')
    // cart button in header
    const cartBtn = page.locator('[data-testid="cart-button"], button[aria-label*="سبد"]').first()
    await expect(cartBtn).toBeVisible()
  })
})
