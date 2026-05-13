/**
 * Seed script — imports real Beewaz products from beewaz-co.com
 * Run: npx tsx src/lib/db/seed-products.ts
 */

import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import { categories, products, productSpecs } from './schema'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, { prepare: false })
const db = drizzle(sql, { schema })

// ─── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'alarm-panels',    nameFa: 'دزدگیرهای مرکزی',        nameEn: 'Alarm Panels',        sortOrder: 1 },
  { slug: 'sirens',          nameFa: 'آژیر و بلندگو',           nameEn: 'Sirens & Speakers',   sortOrder: 2 },
  { slug: 'motion-sensors',  nameFa: 'حسگرهای تشخیص حرکت',    nameEn: 'Motion Sensors',      sortOrder: 3 },
  { slug: 'sensors',         nameFa: 'سنسورها',                 nameEn: 'Sensors',             sortOrder: 4 },
  { slug: 'power-supply',    nameFa: 'منبع تغذیه و آنتن',      nameEn: 'Power & Antennas',    sortOrder: 5 },
  { slug: 'control',         nameFa: 'تجهیزات کنترلی',         nameEn: 'Control Equipment',   sortOrder: 6 },
]

// ─── Products ─────────────────────────────────────────────────────────────────

type ProductSeed = {
  sku: string
  nameFa: string
  slug: string
  descriptionFa: string
  price: number
  categorySlug: string
  isFeatured: boolean
  stock: number
  specs: { key: string; value: string }[]
}

const PRODUCTS: ProductSeed[] = [
  {
    sku: 'BH10',
    nameFa: 'دستگاه دزدگیر BH10 بیواز',
    slug: 'dastgah-dozd-gir-bh10',
    descriptionFa: 'نسل دوم از سری دزدگیرهای BH است که با پشتیبانی از سیم‌کارت، امکانات کامل و پیشرفته‌ای را برای حفاظت از اماکن مسکونی، تجاری و اداری ارائه می‌دهد.',
    price: 15_300_000,
    categorySlug: 'alarm-panels',
    isFeatured: true,
    stock: 15,
    specs: [
      { key: 'نمایشگر', value: 'TFT LCD 1.8 اینچ' },
      { key: 'زون‌های سیمی', value: '۴ زون' },
      { key: 'زون‌های بی‌سیم', value: '۳۰ زون' },
      { key: 'فرکانس بی‌سیم', value: '۳۱۵ مگاهرتز' },
      { key: 'منبع تغذیه', value: '۱۹۰-۲۳۰ ولت AC' },
      { key: 'باتری پشتیبان', value: 'سرب اسید ۴ تا ۷ آمپر' },
      { key: 'کنترل', value: 'کیپد ۴×۴ / اپ موبایل iOS و Android' },
      { key: 'ریموت‌های پشتیبانی‌شده', value: 'تا ۲۰ ریموت' },
      { key: 'ابعاد', value: '۲۸۰ × ۲۲۰ میلی‌متر' },
      { key: 'وزن', value: '۱۸۰۰ گرم' },
    ],
  },
  {
    sku: 'BH11',
    nameFa: 'دستگاه دزدگیر BH11 بیواز',
    slug: 'dastgah-dozd-gir-bh11',
    descriptionFa: 'یکی از کامل‌ترین سیستم‌های دزدگیر موجود در بازار، با قابلیت‌های متنوع و نوآورانه طراحی شده. دارای نمایشگر LCD رنگی، رابط کاملاً فارسی، و امکانات پیشرفته برای کنترل و نظارت از راه دور.',
    price: 16_900_000,
    categorySlug: 'alarm-panels',
    isFeatured: true,
    stock: 12,
    specs: [
      { key: 'نمایشگر', value: 'TFT LCD 1.8 اینچ' },
      { key: 'زون‌های بی‌سیم', value: '۳۰ زون' },
      { key: 'زون‌های سیمی', value: '۴ زون' },
      { key: 'فرکانس بی‌سیم', value: '۳۱۵ مگاهرتز' },
      { key: 'منبع تغذیه', value: '۱۹۰-۲۳۰ ولت AC' },
      { key: 'باتری', value: 'سرب اسید ۴ تا ۷ آمپر' },
      { key: 'حافظه تماس', value: '۱۵ شماره' },
      { key: 'لاگ رویداد', value: '۱۰۲۴ رکورد' },
      { key: 'ریموت‌های پشتیبانی‌شده', value: 'تا ۲۰ ریموت' },
      { key: 'ابعاد', value: '۲۸۰ × ۲۲۰ میلی‌متر' },
      { key: 'وزن', value: '۱۸۰۰ گرم' },
    ],
  },
  {
    sku: 'PZ120',
    nameFa: 'آژیر پیزو بیواز PZ120',
    slug: 'azhir-piezo-pz120',
    descriptionFa: 'آژیر پیزو برای نصب در فضای داخلی طراحی شده است و به دلیل تولید صدای زیر و تیز، در صورت ورود غیرمجاز به‌سرعت فعال می‌شود.',
    price: 390_000,
    categorySlug: 'sirens',
    isFeatured: false,
    stock: 50,
    specs: [
      { key: 'ولتاژ کاری', value: '۶-۱۵ ولت DC' },
      { key: 'جریان مصرفی', value: '۱۲۰ میلی‌آمپر (در ۱۲ ولت)' },
      { key: 'فرکانس کاری', value: '۳.۸ کیلوهرتز' },
      { key: 'شدت صدا', value: '۱۲۰ دسی‌بل' },
      { key: 'نوع صدا', value: 'تک‌صدا' },
      { key: 'جنس بدنه', value: 'ABS مقاوم' },
      { key: 'ابعاد', value: '۵۵ × ۷۲ میلی‌متر' },
      { key: 'وزن', value: '۱۰۰ گرم' },
    ],
  },
  {
    sku: 'BSP10',
    nameFa: 'آژیر بک‌آپ سیمی بیواز BSP10',
    slug: 'azhir-backup-simi-bsp10',
    descriptionFa: 'آژیر فلاشر خارجی با تولید صدای قدرتمند و نور چشمک‌زن LED، در زمان هشدار باعث جلب توجه افراد می‌شود. مناسب برای نصب روی ساختمان، ویلا و فضاهای صنعتی.',
    price: 8_700_000,
    categorySlug: 'sirens',
    isFeatured: true,
    stock: 20,
    specs: [
      { key: 'منبع تغذیه', value: '۱۴ ولت DC / ۲ آمپر' },
      { key: 'جریان مصرفی آماده‌باش', value: '۲۵۰ میلی‌آمپر' },
      { key: 'جریان مصرفی فعال', value: '۱.۵ آمپر' },
      { key: 'باتری', value: 'سرب اسید ۱ تا ۷ آمپر' },
      { key: 'شدت صدا', value: '۱۲۰ دسی‌بل' },
      { key: 'ابعاد', value: '۲۷۰ × ۱۸۵ میلی‌متر' },
      { key: 'وزن', value: '۱۸۰۰ گرم (با باتری ۱.۳ آمپر)' },
      { key: 'مقاومت محیطی', value: 'ضد UV، باران، برف، گرد و غبار' },
    ],
  },
  {
    sku: 'BSP30',
    nameFa: 'بلندگو بیواز BSP30',
    slug: 'bolandgo-bsp30',
    descriptionFa: 'بلندگو بیواز برای ایجاد هشدار صوتی قدرتمند، واضح و پایدار در سیستم‌های اعلام سرقت طراحی شده است.',
    price: 990_000,
    categorySlug: 'sirens',
    isFeatured: false,
    stock: 30,
    specs: [
      { key: 'توان خروجی', value: '۳۰ وات' },
      { key: 'امپدانس', value: '۸ اهم' },
      { key: 'اتصالات', value: '۲ سیم صوتی' },
      { key: 'ابعاد', value: '۱۵۰ × ۱۵۰ میلی‌متر' },
    ],
  },
  {
    sku: 'P110',
    nameFa: 'چشمی سیمی وزنی بیواز P110',
    slug: 'cheshmie-simi-vazni-p110',
    descriptionFa: 'حسگر PIR سیمی با تنظیم خودکار حساسیت بر اساس نور و دما، کلید تمپر و کالیبراسیون حساسیت وزنی برای کاهش هشدارهای کاذب.',
    price: 1_740_000,
    categorySlug: 'motion-sensors',
    isFeatured: true,
    stock: 40,
    specs: [
      { key: 'نوع حسگر', value: 'PIR (مادون قرمز غیرفعال)' },
      { key: 'ولتاژ کاری', value: '۵-۲۵ ولت DC' },
      { key: 'جریان آماده‌باش', value: '۸ میکروآمپر' },
      { key: 'جریان فعال', value: '۱۵ میلی‌آمپر' },
      { key: 'ابعاد', value: '۷۵ × ۱۰۵ میلی‌متر' },
      { key: 'وزن', value: '۴۵ گرم' },
      { key: 'ویژگی‌ها', value: 'تنظیم خودکار حساسیت، کلید تمپر، LED وضعیت' },
    ],
  },
  {
    sku: 'P100',
    nameFa: 'چشمی حرکتی بیواز P100',
    slug: 'cheshmie-harekati-p100',
    descriptionFa: 'حسگر حرکتی PIR سیمی بیواز با عملکرد دقیق، تنظیم خودکار حساسیت، کلید تمپر و سنسورهای نور و دما. مجهز به مد پالس یک و دو.',
    price: 1_320_000,
    categorySlug: 'motion-sensors',
    isFeatured: false,
    stock: 45,
    specs: [
      { key: 'نوع حسگر', value: 'PIR (مادون قرمز غیرفعال)' },
      { key: 'تنظیم حساسیت', value: 'خودکار (نور و دما)' },
      { key: 'مد پالس', value: 'تک‌پالس و دوپالس' },
      { key: 'کلید تمپر', value: 'دارد' },
      { key: 'LED وضعیت', value: 'دارد (قابل غیرفعال‌سازی)' },
    ],
  },
  {
    sku: 'BSH30',
    nameFa: 'شوک‌سنسور سیمی بیواز BSH30',
    slug: 'shok-sensor-simi-bsh30',
    descriptionFa: 'شوک‌سنسور بیواز برای تشخیص انواع شوک‌های مکانیکی طراحی شده است؛ از جمله شکست شیشه، تخریب دیوار، ضربه و حتی باز شدن درب. با قابلیت تنظیم حساسیت دقیق.',
    price: 970_000,
    categorySlug: 'sensors',
    isFeatured: false,
    stock: 35,
    specs: [
      { key: 'ولتاژ کاری', value: '۵-۲۵ ولت DC' },
      { key: 'جریان آماده‌باش', value: '۱۰۰ میکروآمپر' },
      { key: 'جریان فعال', value: '۲۵ میلی‌آمپر' },
      { key: 'ابعاد', value: '۳۷ × ۸۰ میلی‌متر' },
      { key: 'وزن', value: '۳۷ گرم' },
      { key: 'تنظیم حساسیت', value: 'پتانسیومتر + جامپر (تا ۳ برابر)' },
      { key: 'ویژگی‌ها', value: 'کلید تمپر، دکمه تست، نصب سری' },
    ],
  },
  {
    sku: 'MG11',
    nameFa: 'مگنت بی‌سیم بیواز MG11',
    slug: 'magnet-bisim-mg11',
    descriptionFa: 'مگنت بی‌سیم حسگر مجاورتی دو بخشی (آهنربا + قطعه حساس) برای تشخیص باز شدن درب، پنجره، کشو، کمد و گاوصندوق. استفاده از آهنربای نئودیومی.',
    price: 890_000,
    categorySlug: 'sensors',
    isFeatured: true,
    stock: 60,
    specs: [
      { key: 'فرکانس بی‌سیم', value: '۳۱۵/۴۳۳ مگاهرتز' },
      { key: 'باتری', value: '۲۳A' },
      { key: 'جریان آماده‌باش', value: '۸ میکروآمپر' },
      { key: 'جریان فعال', value: '۲۵ میلی‌آمپر' },
      { key: 'ابعاد', value: '۳۷ × ۸۰ میلی‌متر' },
      { key: 'وزن', value: '۳۷ گرم' },
      { key: 'آنتن', value: 'سیمی (ضمیمه)' },
      { key: 'کلید تمپر', value: 'دارد' },
    ],
  },
  {
    sku: 'MG10',
    nameFa: 'مگنت سیمی بیواز MG10',
    slug: 'magnet-simi-mg10',
    descriptionFa: 'حسگر مجاورت سیمی دو بخشی با آهنربای نئودیومی. با فاصله گرفتن دو بخش (باز شدن درب/پنجره)، سیگنال هشدار به پنل مرکزی ارسال می‌شود.',
    price: 260_000,
    categorySlug: 'sensors',
    isFeatured: false,
    stock: 100,
    specs: [
      { key: 'اتصالات', value: '۲ سیم زون' },
      { key: 'ابعاد', value: '۳۰ × ۱۲ میلی‌متر (هر قطعه)' },
      { key: 'وزن', value: '۱۲ گرم' },
      { key: 'خروجی', value: 'NC (نرمال بسته)' },
      { key: 'نصب', value: 'چسب دو طرفه، پیچ یا کابل‌بند' },
    ],
  },
  {
    sku: 'PS157',
    nameFa: 'منبع تغذیه بیواز PS157',
    slug: 'manba-taghzie-ps157',
    descriptionFa: 'منبع تغذیه بیواز برای تأمین برق پایدار در سیستم‌های الکترونیکی مانند دزدگیر اماکن، دوربین‌های مدار بسته و سنسورها طراحی شده است.',
    price: 2_500_000,
    categorySlug: 'power-supply',
    isFeatured: false,
    stock: 25,
    specs: [
      { key: 'ولتاژ خروجی', value: '۱۳.۸ ولت DC' },
      { key: 'ولتاژ ورودی', value: '۱۸-۲۵ ولت DC یا ۱۸ ولت AC' },
      { key: 'جریان ورودی', value: '۱.۷ آمپر' },
      { key: 'جریان شارژ باتری', value: '۴.۵ / ۷ آمپر (قابل تنظیم)' },
      { key: 'سازگاری باتری', value: '۱۲ ولت سرب اسید' },
      { key: 'فیوز محافظ', value: '۲ آمپر (BAT)' },
      { key: 'ابعاد', value: '۵۰ × ۵۰ میلی‌متر' },
      { key: 'ویژگی‌ها', value: 'سوئیچ خودکار باتری، حفاظت اضافه جریان' },
    ],
  },
  {
    sku: 'AT10',
    nameFa: 'آنتن Sub-GHz بیواز AT10',
    slug: 'antenne-subghz-at10',
    descriptionFa: 'آنتن خارجی بیواز برای تقویت آنتن‌دهی تجهیزات بی‌سیم در شرایط سیگنال ضعیف طراحی شده است.',
    price: 250_000,
    categorySlug: 'power-supply',
    isFeatured: false,
    stock: 40,
    specs: [
      { key: 'فرکانس کاری', value: '۳۰۰ تا ۹۱۵ مگاهرتز' },
      { key: 'کانکتور', value: 'PH 2PIN' },
      { key: 'ابعاد', value: '۲۵ × ۱۲۵ میلی‌متر' },
      { key: 'وزن', value: '۲۱ گرم (با کابل ۳ متر)' },
      { key: 'طول کابل', value: '۳ و ۵ متر' },
    ],
  },
  {
    sku: 'AG11',
    nameFa: 'آنتن GSM بیواز AG11',
    slug: 'antenne-gsm-ag11',
    descriptionFa: 'آنتن GSM خارجی بیواز برای تقویت آنتن‌دهی تجهیزات بی‌سیم در مناطق با سیگنال ضعیف طراحی و تولید شده است.',
    price: 1_100_000,
    categorySlug: 'power-supply',
    isFeatured: false,
    stock: 30,
    specs: [
      { key: 'فرکانس کاری', value: '۹۰۰ مگاهرتز تا ۲.۴ گیگاهرتز' },
      { key: 'کانکتور', value: 'SMA استاندارد' },
      { key: 'نوع کابل', value: 'RG174 با کانکتور SMA' },
      { key: 'ابعاد', value: '۲۵ × ۱۲۵ میلی‌متر' },
      { key: 'وزن', value: '۶۰ گرم (با کابل ۳ متر)' },
      { key: 'طول کابل', value: '۳ و ۵ متر' },
    ],
  },
  {
    sku: 'R10',
    nameFa: 'ریموت کنترل بیواز R10',
    slug: 'remote-control-r10',
    descriptionFa: 'ریموت‌های بیواز در دو مدل با آنتن خارجی و بدون آنتن خارجی تولید می‌شوند و برای کنترل تجهیزات دزدگیر طراحی شده‌اند.',
    price: 750_000,
    categorySlug: 'control',
    isFeatured: false,
    stock: 80,
    specs: [
      { key: 'فرکانس', value: '۳۱۵ / ۴۳۳ مگاهرتز' },
      { key: 'باتری', value: '27A' },
      { key: 'تعداد دکمه', value: '۴ دکمه فیزیکی' },
      { key: 'بهره آنتن', value: '۱۳ دسی‌بل' },
      { key: 'ابعاد', value: '۳۸ × ۱۰ × ۷۰ میلی‌متر' },
      { key: 'وزن', value: '۲۷ گرم' },
    ],
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Seeding categories…')

  const insertedCategories = await db
    .insert(categories)
    .values(CATEGORIES)
    .onConflictDoUpdate({
      target: categories.slug,
      set: { nameFa: schema.categories.nameFa, sortOrder: schema.categories.sortOrder },
    })
    .returning({ id: categories.id, slug: categories.slug })

  const catMap = Object.fromEntries(insertedCategories.map((c) => [c.slug, c.id]))
  console.log(`  ✅  ${insertedCategories.length} categories ready`)

  console.log('🌱  Seeding products…')

  for (const p of PRODUCTS) {
    const categoryId = catMap[p.categorySlug]
    if (!categoryId) {
      console.warn(`  ⚠️  Unknown category slug: ${p.categorySlug}`)
      continue
    }

    const [inserted] = await db
      .insert(products)
      .values({
        sku: p.sku,
        nameFa: p.nameFa,
        slug: p.slug,
        descriptionFa: p.descriptionFa,
        price: p.price,
        categoryId,
        stock: p.stock,
        isFeatured: p.isFeatured,
        status: 'active',
      })
      .onConflictDoUpdate({
        target: products.sku,
        set: {
          nameFa: p.nameFa,
          slug: p.slug,
          descriptionFa: p.descriptionFa,
          price: p.price,
          categoryId,
          stock: p.stock,
          isFeatured: p.isFeatured,
          status: 'active',
          updatedAt: new Date(),
        },
      })
      .returning({ id: products.id })

    if (!inserted) continue

    // delete old specs then re-insert
    await db.delete(productSpecs).where(
      (await import('drizzle-orm')).eq(productSpecs.productId, inserted.id)
    )

    if (p.specs.length > 0) {
      await db.insert(productSpecs).values(
        p.specs.map((s, i) => ({
          productId: inserted.id,
          keyFa: s.key,
          valueFa: s.value,
          sortOrder: i,
        }))
      )
    }

    console.log(`  ✅  ${p.sku} — ${p.nameFa}`)
  }

  console.log('\n🎉  Done!')
  await sql.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
