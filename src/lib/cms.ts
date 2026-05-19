/**
 * CMS Helper — خواندن محتوا از page_content برای Server Components
 *
 * استفاده:
 *   const cms = await getCmsContent('home', { hero_title: 'پیش‌فرض' })
 *   <h1>{cms.hero_title}</h1>
 */

import { db } from '@/lib/db'
import { pageContent } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type CmsContent = Record<string, string>

/**
 * دریافت محتوای یک صفحه از DB
 * اگر ردیفی در DB نباشد یا خطا رخ دهد، defaults برمی‌گردد
 */
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
    // DB در دسترس نیست یا جدول وجود ندارد — defaults را برمی‌گردانیم
    return defaults
  }
}

/**
 * دریافت محتوای چند صفحه در یک query
 */
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
