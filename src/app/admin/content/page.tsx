'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

type FieldType = 'text' | 'textarea' | 'url' | 'image' | 'boolean' | 'json' | 'number' | 'color' | 'phone'

interface CmsField {
  key: string; label: string; type: FieldType
  hint?: string; required?: boolean; placeholder?: string; rows?: number
  group: 'settings' | 'page'; page?: string
}

const FIELD_SECTIONS: { id: string; label: string; icon: string; fields: CmsField[] }[] = [
  {
    id: 'announcement', label: 'نوار اطلاع‌رسانی', icon: '\u{1F4E2}',
    fields: [
      { key: 'announcement_active', label: 'نوار فعال باشد',     type: 'boolean',  group: 'page', page: 'global' },
      { key: 'announcement_text',   label: 'متن نوار',           type: 'text',     group: 'page', page: 'global', placeholder: '\u{1F389} ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان' },
      { key: 'announcement_url',    label: 'لینک نوار',          type: 'url',      group: 'page', page: 'global', placeholder: '/shop' },
      { key: 'announcement_color',  label: 'رنگ پس‌زمینه',  type: 'color',    group: 'page', page: 'global' },
    ],
  },
  {
    id: 'hero', label: 'بخش Hero (تیتر اصلی)', icon: '\u{1F9B8}',
    fields: [
      { key: 'hero_badge',             label: 'بج روی عنوان',   type: 'text',     group: 'page', page: 'home', placeholder: '\u{1F512} بیش از ۱۵,۰۰۰ مشتری راضی' },
      { key: 'hero_title',             label: 'عنوان اصلی',     type: 'textarea', group: 'page', page: 'home', rows: 2 },
      { key: 'hero_subtitle',          label: 'زیرعنوان',       type: 'textarea', group: 'page', page: 'home', rows: 2 },
      { key: 'hero_cta_primary',       label: 'دکمه اول',       type: 'text',     group: 'page', page: 'home', placeholder: 'مشاوره رایگان' },
      { key: 'hero_cta_primary_url',   label: 'لینک دکمه اول', type: 'url',      group: 'page', page: 'home', placeholder: '/contact' },
      { key: 'hero_cta_secondary',     label: 'دکمه دوم',       type: 'text',     group: 'page', page: 'home', placeholder: 'مشاهده محصولات' },
      { key: 'hero_cta_secondary_url', label: 'لینک دکمه دوم', type: 'url',      group: 'page', page: 'home', placeholder: '/shop' },
      { key: 'hero_features',          label: 'ویژگی‌ها (هر خط یک مورد)', type: 'textarea', group: 'page', page: 'home', rows: 4, hint: 'هر خط یک ویژگی' },
      { key: 'hero_stat1_value', label: 'آمار ۱ — عدد',    type: 'text', group: 'page', page: 'home', placeholder: '۵۰۰+' },
      { key: 'hero_stat1_label', label: 'آمار ۱ — برچسب', type: 'text', group: 'page', page: 'home', placeholder: 'پروژه نصب' },
      { key: 'hero_stat2_value', label: 'آمار ۲ — عدد',    type: 'text', group: 'page', page: 'home', placeholder: '۱۰+' },
      { key: 'hero_stat2_label', label: 'آمار ۲ — برچسب', type: 'text', group: 'page', page: 'home', placeholder: 'سال تجربه' },
      { key: 'hero_stat3_value', label: 'آمار ۳ — عدد',    type: 'text', group: 'page', page: 'home', placeholder: '۹۸٪' },
      { key: 'hero_stat3_label', label: 'آمار ۳ — برچسب', type: 'text', group: 'page', page: 'home', placeholder: 'رضایت مشتریان' },
    ],
  },
  {
    id: 'how', label: 'بخش «چطور کار می‌کند»', icon: '\u{1F522}',
    fields: [
      { key: 'how_title',    label: 'عنوان بخش',    type: 'text',     group: 'page', page: 'home', placeholder: '۴ گام تا امنیت کامل' },
      { key: 'how_subtitle', label: 'زیرعنوان',      type: 'text',     group: 'page', page: 'home' },
      { key: 'how_steps',    label: 'مراحل (JSON)', type: 'json',     group: 'page', page: 'home', rows: 10,
        hint: 'آرایه JSON با فیلدهای: icon, title, desc' },
    ],
  },
  {
    id: 'cta', label: 'بخش CTA (دعوت به عمل)', icon: '\u{1F4E3}',
    fields: [
      { key: 'cta_title',      label: 'عنوان CTA',          type: 'text',     group: 'page', page: 'home' },
      { key: 'cta_subtitle',   label: 'زیرعنوان CTA',       type: 'textarea', group: 'page', page: 'home', rows: 2 },
      { key: 'cta_button',     label: 'متن دکمه',           type: 'text',     group: 'page', page: 'home', placeholder: 'مشاوره رایگان' },
      { key: 'cta_button_url', label: 'لینک دکمه',          type: 'url',      group: 'page', page: 'home', placeholder: '/contact' },
      { key: 'contact_phone',  label: 'شماره تلفن نمایشی', type: 'phone',    group: 'settings', hint: 'اگر پر باشد، دکمه تماس نمایش داده می‌شود' },
    ],
  },
  {
    id: 'general', label: 'تنظیمات عمومی سایت', icon: '⚙️',
    fields: [
      { key: 'site_name',        label: 'نام سایت',               type: 'text',     group: 'settings', required: true },
      { key: 'site_tagline',     label: 'شعار سایت',              type: 'text',     group: 'settings' },
      { key: 'site_description', label: 'توضیح SEO سایت',         type: 'textarea', group: 'settings', rows: 2 },
      { key: 'site_keywords',    label: 'کلمات کلیدی SEO',        type: 'text',     group: 'settings', hint: 'با کاما جدا کنید' },
      { key: 'logo_url',         label: 'آدرس لوگو',              type: 'image',    group: 'settings', placeholder: '/images/logo.png' },
      { key: 'og_image_url',     label: 'تصویر اشتراک‌گذاری', type: 'image',  group: 'settings' },
    ],
  },
  {
    id: 'contact', label: 'اطلاعات تماس', icon: '\u{1F4DE}',
    fields: [
      { key: 'contact_phone',   label: 'شماره ثابت',   type: 'phone',    group: 'settings', placeholder: '021-00000000' },
      { key: 'contact_phone2',  label: 'شماره موبایل', type: 'phone',    group: 'settings' },
      { key: 'whatsapp_number', label: 'واتس‌اپ',  type: 'phone',    group: 'settings', hint: 'فرمت: 989121234567' },
      { key: 'contact_email',   label: 'ایمیل',        type: 'text',     group: 'settings', placeholder: 'info@beewaz.ir' },
      { key: 'contact_address', label: 'آدرس',         type: 'textarea', group: 'settings', rows: 2 },
      { key: 'contact_hours',   label: 'ساعت کاری',    type: 'text',     group: 'settings', placeholder: 'شنبه تا چهارشنبه ۸ تا ۱۷' },
    ],
  },
  {
    id: 'social', label: 'شبکه‌های اجتماعی', icon: '\u{1F310}',
    fields: [
      { key: 'social_instagram', label: 'اینستاگرام', type: 'url', group: 'settings', placeholder: 'https://instagram.com/beewaz.ir' },
      { key: 'social_telegram',  label: 'تلگرام',     type: 'url', group: 'settings' },
      { key: 'social_youtube',   label: 'یوتیوب',     type: 'url', group: 'settings' },
      { key: 'social_linkedin',  label: 'لینکدین',    type: 'url', group: 'settings' },
    ],
  },
  {
    id: 'commerce', label: 'تنظیمات فروشگاه', icon: '\u{1F6D2}',
    fields: [
      { key: 'free_shipping_threshold',  label: 'حد ارسال رایگان (تومان)',      type: 'number',   group: 'settings' },
      { key: 'default_warranty_months',  label: 'ماه‌های گارانتی پیش‌فرض', type: 'number', group: 'settings' },
      { key: 'shop_enabled',             label: 'فروشگاه فعال',               type: 'boolean',  group: 'settings' },
      { key: 'checkout_notes',           label: 'توضیح صفحه پرداخت',          type: 'textarea', group: 'settings', rows: 2 },
      { key: 'admin_order_notify_phone', label: 'تلفن اطلاع‌رسانی سفارش',type: 'phone',    group: 'settings' },
    ],
  },
]

function CmsInput({ field, value, onChange }: { field: CmsField; value: string; onChange: (v: string) => void }) {
  const cls = "w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"

  if (field.type === 'boolean') {
    const checked = value === 'true' || value === '1'
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-100">
        <button type="button" onClick={() => onChange(checked ? 'false' : 'true')}
          className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-brand-500' : 'bg-surface-200'}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'right-1' : 'left-1'}`} />
        </button>
        <span className="text-sm font-semibold text-surface-700">{checked ? 'فعال' : 'غیرفعال'}</span>
      </div>
    )
  }

  if (field.type === 'color') {
    return (
      <div className="flex items-center gap-3">
        <input type="color" value={value || '#f59e0b'} onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-surface-200 cursor-pointer" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className={`${cls} flex-1 font-mono`} dir="ltr" placeholder="#f59e0b" />
      </div>
    )
  }

  if (field.type === 'image') {
    return (
      <div className="space-y-2">
        <input type="url" value={value} onChange={e => onChange(e.target.value)}
          className={`${cls} font-mono`} dir="ltr" placeholder={field.placeholder} />
        {value ? (
          <div className="flex items-center gap-3 p-2 bg-surface-50 rounded-xl border border-surface-100">
            <img src={value} alt="" className="w-12 h-12 object-contain rounded-lg bg-white border border-surface-100"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <p className="text-xs text-surface-400 break-all" dir="ltr">{value}</p>
          </div>
        ) : null}
      </div>
    )
  }

  if (field.type === 'textarea' || field.type === 'json') {
    const isJson = field.type === 'json'
    return (
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={field.rows ?? 3}
        className={`${cls} resize-y ${isJson ? 'font-mono text-xs' : ''}`}
        dir={isJson ? 'ltr' : 'rtl'} placeholder={field.placeholder} />
    )
  }

  return (
    <input
      type={field.type === 'number' ? 'number' : 'text'}
      value={value} onChange={e => onChange(e.target.value)}
      className={`${cls} ${['url','number','phone'].includes(field.type) ? 'font-mono' : ''}`}
      dir={['url','number'].includes(field.type) ? 'ltr' : 'rtl'}
      placeholder={field.placeholder} required={field.required}
    />
  )
}

export default function ContentPage() {
  const [activeSection, setActiveSection] = useState(FIELD_SECTIONS[0]!.id)
  const [values, setValues]               = useState<Record<string, string>>({})
  const [loading, setLoading]             = useState(true)
  const [saving, setSaving]               = useState(false)
  const [toast, setToast]                 = useState('')
  const [changed, setChanged]             = useState(false)
  const [seeding, setSeeding]             = useState(false)
  const initial                           = useRef<Record<string, string>>({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/cms')
      const j = await res.json() as { settingsMap: Record<string,string>; contentMap: Record<string,Record<string,string>> }
      const flat: Record<string, string> = {}
      for (const [k, v] of Object.entries(j.settingsMap ?? {})) flat[`s::${k}`] = v
      for (const [page, keys] of Object.entries(j.contentMap ?? {})) {
        for (const [k, v] of Object.entries(keys)) flat[`c::${page}::${k}`] = v
      }
      setValues(flat); initial.current = { ...flat }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const getKey = (f: CmsField) => f.group === 'settings' ? `s::${f.key}` : `c::${f.page}::${f.key}`
  const getValue = (f: CmsField) => values[getKey(f)] ?? ''
  const setValue = (f: CmsField, v: string) => {
    setValues(p => ({ ...p, [getKey(f)]: v })); setChanged(true)
  }

  const save = async () => {
    setSaving(true)
    const settings: Record<string, string> = {}
    const content: Record<string, Record<string, string>> = {}
    for (const [k, v] of Object.entries(values)) {
      if (k.startsWith('s::')) { settings[k.slice(3)] = v }
      else if (k.startsWith('c::')) {
        const [, page, key] = k.split('::')
        if (!content[page]) content[page] = {}
        content[page][key] = v
      }
    }
    const res = await fetch('/api/admin/cms', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings, content }),
    })
    if (res.ok) {
      initial.current = { ...values }; setChanged(false)
      setToast('تنظیمات با موفقیت ذخیره شد'); setTimeout(() => setToast(''), 3000)
    }
    setSaving(false)
  }

  const handleSeed = async () => {
    setSeeding(true)
    await fetch('/api/admin/cms', { method: 'POST' })
    await fetchData(); setSeeding(false)
    setToast('مقادیر پیش‌فرض بارگذاری شدند'); setTimeout(() => setToast(''), 3000)
  }

  const section = FIELD_SECTIONS.find(s => s.id === activeSection)

  return (
    <div className="flex-1 flex overflow-hidden">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold">
          {toast}
        </div>
      )}

      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 border-l border-surface-100 overflow-y-auto bg-surface-50 p-3">
        <p className="text-xs font-bold text-surface-400 uppercase tracking-wide px-2 py-2">بخش‌ها</p>
        {FIELD_SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-0.5 text-start ${activeSection === s.id ? 'bg-white text-brand-700 shadow-sm border border-surface-100' : 'text-surface-600 hover:bg-white hover:text-surface-900'}`}>
            <span>{s.icon}</span><span className="truncate">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-surface-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black text-surface-900">{section?.icon} {section?.label}</h1>
              <p className="text-xs text-surface-400 mt-0.5">محتوای سایت را ویرایش کنید — بلادرنگ روی سایت اعمال می‌شود</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSeed} disabled={seeding}
                className="btn btn-outline text-xs py-2 px-3 disabled:opacity-50">
                {seeding ? 'بارگذاری...' : 'پیش‌فرض‌ها'}
              </button>
              <a href="https://bz360.ir" target="_blank" className="btn btn-outline text-xs py-2 px-3">مشاهده سایت</a>
              <button onClick={save} disabled={saving || !changed}
                className={`btn text-sm py-2.5 px-5 ${changed ? 'btn-primary' : 'btn-outline opacity-50 cursor-not-allowed'}`}>
                {saving ? 'ذخیره...' : '\u{1F4BE} ذخیره تغییرات'}
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-surface-300">بارگذاری...</div>
          ) : section ? (
            <div className="max-w-2xl space-y-5">
              <div className="bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                <div>
                  <p className="text-sm font-bold text-brand-800">{section.label}</p>
                  <p className="text-xs text-brand-600">{section.fields.length} فیلد قابل ویرایش</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-surface-200 divide-y divide-surface-50">
                {section.fields.map(field => (
                  <div key={field.key} className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <label className="block text-sm font-bold text-surface-800">
                        {field.label}{field.required && <span className="text-red-500 mr-1">*</span>}
                      </label>
                      <span className="text-xs bg-surface-50 text-surface-400 border border-surface-100 px-2 py-0.5 rounded-full font-mono flex-shrink-0">{field.key}</span>
                    </div>
                    {field.hint && <p className="text-xs text-surface-400 mb-2 leading-relaxed">{field.hint}</p>}
                    <CmsInput field={field} value={getValue(field)} onChange={v => setValue(field, v)} />
                    {values[getKey(field)] !== initial.current[getKey(field)] && (
                      <p className="text-xs text-amber-600 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block ml-1" />
                        تغییر داده شده — هنوز ذخیره نشده
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={save} disabled={saving || !changed}
                  className={`btn text-sm py-3 px-8 ${changed ? 'btn-primary' : 'btn-outline opacity-50 cursor-not-allowed'}`}>
                  {saving ? 'ذخیره...' : '\u{1F4BE} ذخیره همه تغییرات'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
