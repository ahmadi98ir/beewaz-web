'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('بیواز')
  const [siteDescription, setSiteDescription] = useState('فروشگاه آنلاین بیواز')
  const [contactEmail, setContactEmail] = useState('info@beewaz.ir')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-surface-900">تنظیمات</h1>
          <p className="text-xs text-surface-400 mt-0.5">مدیریت تنظیمات سایت</p>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-2xl space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <h3 className="font-bold text-surface-900 mb-4">تنظیمات کلی</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">
                  نام سایت
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">
                  توضیح سایت
                </label>
                <textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  rows={3}
                  className="input w-full resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">
                  ایمیل تماس
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <h3 className="font-bold text-surface-900 mb-4">تنظیمات SEO</h3>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              <p className="font-semibold mb-1">Sitemap و Robots.txt</p>
              <p className="text-xs">فایل‌های sitemap.xml و robots.txt به‌صورت خودکار تولید می‌شوند.</p>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <h3 className="font-bold text-surface-900 mb-4">تنظیمات امنیتی</h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-brand-600" />
                <span className="text-sm font-medium text-surface-700">فعال کردن HTTPS</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-brand-600" />
                <span className="text-sm font-medium text-surface-700">نیاز به احراز هویت دو مرحله‌ای برای ادمین</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-brand-600" />
                <span className="text-sm font-medium text-surface-700">فعال کردن CSRF Protection</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="btn btn-primary py-2.5 px-6"
            >
              ذخیره تغییرات
            </button>
            {saved && (
              <span className="text-green-600 text-sm font-medium animate-fade-in">✓ تغییرات ذخیره شد</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
