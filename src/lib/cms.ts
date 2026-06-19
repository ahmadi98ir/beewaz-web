/**
 * CMS Helper — خواندن محتوا از page_content و site_settings برای Server Components
 */

import { db } from '@/lib/db'
import { pageContent, siteSettings, menuItems } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { navigation as staticNavigation, footerLinks as staticFooterLinks, type NavItem } from '@/config/navigation'

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

/** دریافت منوی ناوبری هدر — اگر در دیتابیس آیتمی نباشد، fallback به config/navigation.ts */
export async function getHeaderNav(): Promise<NavItem[]> {
  try {
    const rows = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.location, 'header'))
      .orderBy(asc(menuItems.sortOrder))

    const active = rows.filter((r) => r.active)
    if (active.length === 0) return staticNavigation

    const top = active.filter((r) => r.parentId === null)
    return top.map((item) => ({
      label: item.label,
      href: item.href,
      children: active
        .filter((c) => c.parentId === item.id)
        .map((c) => ({ label: c.label, href: c.href, description: c.description ?? undefined })),
    })).map((item) => ({ ...item, children: item.children.length ? item.children : undefined }))
  } catch {
    return staticNavigation
  }
}

/** دریافت لینک‌های فوتر — اگر در دیتابیس آیتمی نباشد، fallback به config/navigation.ts */
export async function getFooterLinks(): Promise<typeof staticFooterLinks> {
  try {
    const allRows = await db
      .select()
      .from(menuItems)
      .orderBy(asc(menuItems.sortOrder))

    const shop      = allRows.filter((r) => r.location === 'footer_shop' && r.active)
    const knowledge = allRows.filter((r) => r.location === 'footer_knowledge' && r.active)
    const company   = allRows.filter((r) => r.location === 'footer_company' && r.active)

    if (shop.length === 0 && knowledge.length === 0 && company.length === 0) {
      return staticFooterLinks
    }

    const map = (list: typeof shop) => list.map((r) => ({ label: r.label, href: r.href }))

    return {
      shop:      shop.length      ? map(shop)      : staticFooterLinks.shop,
      knowledge: knowledge.length ? map(knowledge) : staticFooterLinks.knowledge,
      company:   company.length   ? map(company)   : staticFooterLinks.company,
    }
  } catch {
    return staticFooterLinks
  }
}
