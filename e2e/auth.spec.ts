import { test, expect } from '@playwright/test'

test.describe('احراز هویت', () => {
  test('صفحه ورود بارگذاری می‌شود', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="tel"], input[placeholder*="موبایل"], input[placeholder*="شماره"]').first()).toBeVisible()
  })

  test('ورود با شماره نامعتبر خطا می‌دهد', async ({ page }) => {
    await page.goto('/login')
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="موبایل"], input[placeholder*="شماره"]').first()
    await phoneInput.fill('12345')
    const submitBtn = page.locator('button[type="submit"]').first()
    await submitBtn.click()
    await expect(page.locator('text=معتبر').or(page.locator('text=نامعتبر')).or(page.locator('text=اشتباه'))).toBeVisible({ timeout: 5000 })
  })

  test('دسترسی به پروفایل بدون لاگین ریدایرکت می‌کند', async ({ page }) => {
    await page.goto('/profile')
    await expect(page).toHaveURL(/login/)
  })

  test('دسترسی به پنل ادمین بدون لاگین ریدایرکت می‌کند', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/login/)
  })
})
