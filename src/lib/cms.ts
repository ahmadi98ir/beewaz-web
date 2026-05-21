/**
 * CMS Helper — خواندن محتوا از page_content و site_settings برای Server Components
 */

import { db } from '@/lib/db'
import { pageContent, siteSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type CmsContent = Record<string, string>

/** دریافت محتوای یک صفحه از page_content */
export async function getCmsContent(
  page: string,
  defaults: CmsContent = {},
): Promise<CmsContent> {
  try {
    const rows = await db
      .select({ key: pageContent.key, valueFa: pageContent.valueFa })
      .from(pageContent)
      .where(eq(pageContent.page, page))

    const result: CmsContent = { ...defaults }
    for (const row of rows) {
      if (row.valueFa !== null && row.valueFa !== '') {
        result[row.key] = row.valueFa
      }
    }
    return result
  } catch {
    return defaults
  }
}

/** دریافت تنظیمات کلی سایت از site_settings */
export async function getSiteSettings(
  defaults: CmsContent = {},
): Promise<CmsContent> {
  try {
    const rows = await db
      .select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings)

    const result: CmsContent = { ...defaults }
    for (const row of rows) {
      if (row.value !== null && row.value !== '') {
        result[row.key] = row.value
      }
    }
    return result
  } catch {
    return defaults
  }
}

/** دریافت محتوای چند صفحه در یک query */
export async function getCmsPages(
  pages: string[],
  defaults: Record<string, CmsContent> = {},
): Promise<Record<string, CmsContent>> {
  const result: Record<string, CmsContent> = {}
  for (const p of pages) {
    result[p] = { ...(defaults[p] ?? {}) }
  }

  try {
    const rows = await db
      .select({ page: pageContent.page, key: pageContent.key, valueFa: pageContent.valueFa })
      .from(pageContent)

    for (const row of rows) {
      if (!result[row.page]) result[row.page] = {}
      const pageData = result[row.page]!
      if (row.valueFa !== null && row.valueFa !== '') {
        pageData[row.key] = row.valueFa
      }
    }
  } catch {
    // silent fail
  }

  return result
}
