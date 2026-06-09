/**
 * seed-locations.ts
 * اجرا: npx tsx scripts/seed-locations.ts
 * ۳۱ استان ایران + شهرهای اصلی هر استان را در DB ثبت می‌کند
 */

import { db } from '../src/lib/db'
import { provinces, cities } from '../src/lib/db/schema/locations'
import { sql } from 'drizzle-orm'

const SEED_DATA: Array<{ nameFa: string; code: string; sortOrder: number; cities: string[] }> = [
  {
    nameFa: 'تهران', code: '23', sortOrder: 1,
    cities: ['تهران', 'کرج', 'ری', 'شهریار', 'اسلامشهر', 'قدس', 'پاکدشت', 'ورامین', 'دماوند'],
  },
  {
    nameFa: 'اصفهان', code: '10', sortOrder: 2,
    cities: ['اصفهان', 'کاشان', 'خمینی‌شهر', 'نجف‌آباد', 'شاهین‌شهر', 'فلاورجان', 'زرین‌شهر', 'اردستان'],
  },
  {
    nameFa: 'فارس', code: '07', sortOrder: 3,
    cities: ['شیراز', 'مرودشت', 'جهرم', 'کازرون', 'آباده', 'فسا', 'لارستان', 'داراب'],
  },
  {
    nameFa: 'خراسان رضوی', code: '09', sortOrder: 4,
    cities: ['مشهد', 'نیشابور', 'سبزوار', 'تربت حیدریه', 'قوچان', 'کاشمر', 'چناران', 'گناباد'],
  },
  {
    nameFa: 'آذربایجان شرقی', code: '01', sortOrder: 5,
    cities: ['تبریز', 'مراغه', 'مرند', 'اهر', 'میانه', 'سراب', 'بستان‌آباد', 'شبستر'],
  },
  {
    nameFa: 'خوزستان', code: '06', sortOrder: 6,
    cities: ['اهواز', 'آبادان', 'خرمشهر', 'دزفول', 'بندر امام خمینی', 'ماهشهر', 'شوشتر', 'بهبهان'],
  },
  {
    nameFa: 'مازندران', code: '02', sortOrder: 7,
    cities: ['ساری', 'آمل', 'بابل', 'قائم‌شهر', 'بابلسر', 'نوشهر', 'تنکابن', 'چالوس'],
  },
  {
    nameFa: 'گیلان', code: '03', sortOrder: 8,
    cities: ['رشت', 'انزلی', 'لاهیجان', 'لنگرود', 'رودبار', 'آستارا', 'تالش', 'صومعه‌سرا'],
  },
  {
    nameFa: 'کرمان', code: '08', sortOrder: 9,
    cities: ['کرمان', 'سیرجان', 'رفسنجان', 'زرند', 'بم', 'جیرفت', 'کهنوج', 'بردسیر'],
  },
  {
    nameFa: 'البرز', code: '30', sortOrder: 10,
    cities: ['کرج', 'نظرآباد', 'هشتگرد', 'طالقان', 'اشتهارد'],
  },
  {
    nameFa: 'قم', code: '25', sortOrder: 11,
    cities: ['قم'],
  },
  {
    nameFa: 'همدان', code: '13', sortOrder: 12,
    cities: ['همدان', 'ملایر', 'نهاوند', 'تویسرکان', 'رزن', 'کبودرآهنگ'],
  },
  {
    nameFa: 'کرمانشاه', code: '05', sortOrder: 13,
    cities: ['کرمانشاه', 'اسلام‌آباد غرب', 'سنقر', 'کنگاور', 'جوانرود', 'پاوه'],
  },
  {
    nameFa: 'گلستان', code: '27', sortOrder: 14,
    cities: ['گرگان', 'گنبدکاووس', 'علی‌آباد', 'بندر ترکمن', 'کردکوی', 'آق‌قلا'],
  },
  {
    nameFa: 'سیستان و بلوچستان', code: '29', sortOrder: 15,
    cities: ['زاهدان', 'چابهار', 'ایرانشهر', 'خاش', 'نیک‌شهر', 'سرباز'],
  },
  {
    nameFa: 'لرستان', code: '15', sortOrder: 16,
    cities: ['خرم‌آباد', 'بروجرد', 'دورود', 'ازنا', 'کوهدشت', 'الیگودرز'],
  },
  {
    nameFa: 'مرکزی', code: '00', sortOrder: 17,
    cities: ['اراک', 'ساوه', 'خمین', 'محلات', 'آشتیان', 'تفرش'],
  },
  {
    nameFa: 'زنجان', code: '19', sortOrder: 18,
    cities: ['زنجان', 'ابهر', 'خرمدره', 'قیدار', 'ماهنشان'],
  },
  {
    nameFa: 'قزوین', code: '28', sortOrder: 19,
    cities: ['قزوین', 'تاکستان', 'آبیک', 'البرز', 'بویین‌زهرا'],
  },
  {
    nameFa: 'آذربایجان غربی', code: '04', sortOrder: 20,
    cities: ['ارومیه', 'خوی', 'میاندوآب', 'مهاباد', 'بوکان', 'پیرانشهر', 'اشنویه'],
  },
  {
    nameFa: 'اردبیل', code: '17', sortOrder: 21,
    cities: ['اردبیل', 'پارس‌آباد', 'مشگین‌شهر', 'خلخال', 'گرمی', 'نمین'],
  },
  {
    nameFa: 'سمنان', code: '20', sortOrder: 22,
    cities: ['سمنان', 'شاهرود', 'دامغان', 'گرمسار', 'مهدی‌شهر'],
  },
  {
    nameFa: 'بوشهر', code: '18', sortOrder: 23,
    cities: ['بوشهر', 'برازجان', 'جم', 'عسلویه', 'خارک'],
  },
  {
    nameFa: 'یزد', code: '21', sortOrder: 24,
    cities: ['یزد', 'میبد', 'اردکان', 'بافق', 'ابرکوه', 'طبس'],
  },
  {
    nameFa: 'هرمزگان', code: '22', sortOrder: 25,
    cities: ['بندرعباس', 'قشم', 'کیش', 'بندر لنگه', 'میناب', 'جاسک'],
  },
  {
    nameFa: 'خراسان شمالی', code: '31', sortOrder: 26,
    cities: ['بجنورد', 'اسفراین', 'شیروان', 'فاروج', 'مانه و سملقان'],
  },
  {
    nameFa: 'خراسان جنوبی', code: '32', sortOrder: 27,
    cities: ['بیرجند', 'قائن', 'فردوس', 'طبس', 'بشرویه', 'سربیشه'],
  },
  {
    nameFa: 'کهگیلویه و بویراحمد', code: '16', sortOrder: 28,
    cities: ['یاسوج', 'دهدشت', 'گچساران', 'دوگنبدان', 'دیشموک'],
  },
  {
    nameFa: 'چهارمحال و بختیاری', code: '14', sortOrder: 29,
    cities: ['شهرکرد', 'بروجن', 'فارسان', 'لردگان', 'اردل', 'کیان'],
  },
  {
    nameFa: 'ایلام', code: '12', sortOrder: 30,
    cities: ['ایلام', 'دهلران', 'مهران', 'آبدانان', 'ایوان', 'دره‌شهر'],
  },
  {
    nameFa: 'کردستان', code: '11', sortOrder: 31,
    cities: ['سنندج', 'سقز', 'مریوان', 'بانه', 'قروه', 'کامیاران', 'دیواندره'],
  },
]

async function seed() {
  console.log('🌱 شروع seed استان‌ها و شهرها...')

  // پاک کردن داده‌های قبلی (در صورت وجود)
  await db.execute(sql`TRUNCATE TABLE cities, provinces RESTART IDENTITY CASCADE`)

  let totalCities = 0

  for (const province of SEED_DATA) {
    const rows = await db
      .insert(provinces)
      .values({ nameFa: province.nameFa, code: province.code, sortOrder: province.sortOrder })
      .returning({ id: provinces.id })

    const provinceId = rows[0]!.id

    if (province.cities.length > 0) {
      await db.insert(cities).values(
        province.cities.map((name, i) => ({
          provinceId,
          nameFa:    name,
          sortOrder: i,
          isActive:  true,
        }))
      )
      totalCities += province.cities.length
    }

    console.log(`  ✓ ${province.nameFa} (${province.cities.length} شهر)`)
  }

  console.log(`\n✅ Seed کامل شد: ${SEED_DATA.length} استان | ${totalCities} شهر`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ خطا در seed:', err)
  process.exit(1)
})
