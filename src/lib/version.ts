/**
 * شماره نسخه و اطلاعات بیلد — برای نمایش در پنل ادمین
 * SHA و زمان بیلد در CI (.github/workflows/deploy.yml) به‌صورت NEXT_PUBLIC تزریق می‌شوند
 */

import pkg from '../../package.json'

export const APP_VERSION = pkg.version

export const BUILD_SHA = (process.env.NEXT_PUBLIC_BUILD_SHA ?? '').slice(0, 7)

export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME ?? ''

export const FULL_VERSION = BUILD_SHA ? `v${APP_VERSION}+${BUILD_SHA}` : `v${APP_VERSION}`
