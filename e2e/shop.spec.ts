import { test, expect } from '@playwright/test'

test.describe('فروشگاه', () => {
  test('صفحه فروشگاه بارگذاری می‌شود', async ({ page }) => {
    await page.goto('/shop')
    await expect(page).toHaveURL(/shop/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('لیست محصولات نمایش داده می‌شود', async ({ page }) => {
    await page.goto('/shop')
    // wait for at least one product card or a no-products message
    await page.waitForLoadState('networkidle')
    const hasProducts = await page.locator('[data-testid="product-card"]').count()
    const hasEmpty = await page.locator('text=محصولی').count()
    expect(hasProducts + hasEmpty).toBeGreaterThan(0)
  })

  test('صفحه دسته‌بندی باز می‌شود', async ({ page }) => {
    await page.goto('/shop')
    const categoryLink = page.locator('a[href*="/shop/"]').first()
    if (await categoryLink.count() > 0) {
      await categoryLink.click()
      await expect(page).toHaveURL(/\/shop\//)
    }
  })
})
