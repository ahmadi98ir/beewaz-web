/**
 * seed-menu.ts
 * اجرا: npx tsx scripts/seed-menu.ts
 * منوی فعلی هاردکد شده در src/config/navigation.ts را داخل جدول menu_items می‌ریزد
 * تا هم پنل /admin/menu محتوا نشان دهد و هم بشود از طریق آن مدیریتش کرد.
 * اگر جدول از قبل آیتم داشته باشد، اسکریپت چیزی اضافه نمی‌کند (idempotent).
 */

import { db } from '../src/lib/db'
import { menuItems } from '../src/lib/db/schema/menu'
import { navigation, footerLinks } from '../src/config/navigation'

async function main() {
  const existing = await db.select({ id: menuItems.id }).from(menuItems).limit(1)
  if (existing.length > 0) {
    console.log('menu_items از قبل داده دارد — برای جلوگیری از تکرار، چیزی اضافه نشد.')
    return
  }

  let order = 0

  for (const item of navigation) {
    const [parent] = await db.insert(menuItems).values({
      location: 'header',
      parentId: null,
      label: item.label,
      href: item.href,
      sortOrder: order++,
    }).returning({ id: menuItems.id })

    for (const child of item.children ?? []) {
      await db.insert(menuItems).values({
        location: 'header',
        parentId: parent!.id,
        label: child.label,
        href: child.href,
        description: child.description ?? null,
        sortOrder: order++,
      })
    }
  }

  const footerSections: Array<[string, { label: string; href: string }[]]> = [
    ['footer_shop', footerLinks.shop],
    ['footer_knowledge', footerLinks.knowledge],
    ['footer_company', footerLinks.company],
  ]

  for (const [location, links] of footerSections) {
    let sortOrder = 0
    for (const link of links) {
      await db.insert(menuItems).values({
        location,
        parentId: null,
        label: link.label,
        href: link.href,
        sortOrder: sortOrder++,
      })
    }
  }

  console.log('✅ منوی هدر و فوتر با موفقیت seed شد.')
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err)
  process.exit(1)
})
