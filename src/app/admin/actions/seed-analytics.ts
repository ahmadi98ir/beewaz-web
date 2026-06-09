'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

// ۳۰ روز داده تستی برای داشبورد
export async function seedAnalyticsSnapshots() {
  const rows = []
  const now = new Date()

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const date = d.toISOString().slice(0, 10)

    // داده‌های شبیه‌سازی‌شده با روند صعودی
    const base     = 3 + Math.sin(i * 0.4) * 2
    const total    = Math.round(base + Math.random() * 4)
    const paid     = Math.round(total * (0.55 + Math.random() * 0.25))
    const cancelled = Math.round(total * Math.random() * 0.1)
    const revRial  = paid * (4_000_000 + Math.round(Math.random() * 8_000_000))
    const revToman = Math.floor(revRial / 10)
    const aov      = paid > 0 ? Math.floor(revToman / paid) : 0
    const newUsers = Math.round(1 + Math.random() * 5)
    const views    = Math.round(20 + Math.random() * 80)
    const abandoned = Math.round(total * 0.3 + Math.random() * 2)
    const recovered = Math.round(abandoned * 0.2)
    const convBps  = total > 0 ? Math.round((paid / total) * 10000) : 0

    rows.push({
      date, total_orders: total, paid_orders: paid, cancelled_orders: cancelled,
      revenue_rial: revRial, revenue_toman: revToman, aov_toman: aov,
      new_users: newUsers, active_users: newUsers + Math.round(Math.random() * 10),
      product_views_count: views, abandoned_carts: abandoned, recovered_carts: recovered,
      abandoned_value_toman: abandoned * 500_000,
      conversion_rate_bps: convBps,
    })
  }

  await db.execute(sql`
    INSERT INTO analytics_daily_snapshots (
      date, total_orders, paid_orders, cancelled_orders,
      revenue_rial, revenue_toman, aov_toman,
      new_users, active_users, product_views_count,
      abandoned_carts, recovered_carts, abandoned_value_toman, conversion_rate_bps
    )
    SELECT * FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb) AS t(
      date date, total_orders int, paid_orders int, cancelled_orders int,
      revenue_rial bigint, revenue_toman bigint, aov_toman bigint,
      new_users int, active_users int, product_views_count int,
      abandoned_carts int, recovered_carts int, abandoned_value_toman bigint,
      conversion_rate_bps int
    )
    ON CONFLICT (date) DO NOTHING
  `)

  return { seeded: rows.length }
}
