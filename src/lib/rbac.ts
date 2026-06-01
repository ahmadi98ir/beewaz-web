/**
 * RBAC — Role-Based Access Control
 *
 * Permission keys are cached per role in memory for the process lifetime.
 * Cache is invalidated when role-permissions are updated via the admin API.
 */

import { db } from '@/lib/db'
import { rolePermissions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// ── In-process cache ──────────────────────────────────────────────────────────

const cache = new Map<string, Set<string>>()

export function invalidateRoleCache(role?: string) {
  if (role) cache.delete(role)
  else cache.clear()
}

async function getPermissionsForRole(role: string): Promise<Set<string>> {
  if (cache.has(role)) return cache.get(role)!

  const rows = await db
    .select({ permission: rolePermissions.permission })
    .from(rolePermissions)
    .where(eq(rolePermissions.role, role))

  const set = new Set(rows.map((r) => r.permission))
  cache.set(role, set)
  return set
}

// ── Public helpers ────────────────────────────────────────────────────────────

export type PermissionKey =
  | 'dashboard:view'
  | 'analytics:view'
  | 'reports:view'
  | 'orders:read'
  | 'orders:write'
  | 'products:read'
  | 'products:write'
  | 'products:delete'
  | 'categories:write'
  | 'reviews:manage'
  | 'inventory:manage'
  | 'installation:read'
  | 'installation:write'
  | 'leads:read'
  | 'leads:write'
  | 'users:read'
  | 'users:write'
  | 'users:role'
  | 'content:read'
  | 'content:write'
  | 'articles:write'
  | 'coupons:read'
  | 'coupons:write'
  | 'settings:read'
  | 'settings:write'
  | 'roles:manage'

/** Check if a role has a permission (used in API routes & server components) */
export async function roleHasPermission(role: string, permission: PermissionKey): Promise<boolean> {
  const perms = await getPermissionsForRole(role)
  return perms.has(permission)
}

/** Check if a role has ALL listed permissions */
export async function roleHasAll(role: string, ...permissions: PermissionKey[]): Promise<boolean> {
  const perms = await getPermissionsForRole(role)
  return permissions.every((p) => perms.has(p))
}

/** Get all permissions for a role (for UI rendering) */
export async function getPermissions(role: string): Promise<Set<string>> {
  return getPermissionsForRole(role)
}

// ── API route guard ───────────────────────────────────────────────────────────

/**
 * Use in API route handlers to require a specific permission.
 * Falls back to ADMIN_TOKEN cookie for backward compat.
 */
export async function requirePermission(
  req: NextRequest,
  permission: PermissionKey,
): Promise<{ ok: true; role: string } | NextResponse> {
  // 1. Try NextAuth session
  const session = await auth()
  const userRole = (session?.user as { role?: string } | undefined)?.role
  if (userRole) {
    const allowed = await roleHasPermission(userRole, permission)
    if (allowed) return { ok: true, role: userRole }
    return NextResponse.json({ error: 'دسترسی ندارید' }, { status: 403 })
  }

  // 2. Fallback: ADMIN_TOKEN cookie (for backward compat with existing admin panel)
  const adminToken = process.env.ADMIN_TOKEN
  if (adminToken) {
    try {
      const cookieStore = await cookies()
      const cookieToken = cookieStore.get('admin_token')?.value
      if (cookieToken === adminToken) {
        return { ok: true, role: 'admin' }
      }
    } catch { /* noop */ }

    const authHeader = req.headers.get('authorization')
    if (authHeader === `Bearer ${adminToken}`) {
      return { ok: true, role: 'admin' }
    }
  }

  return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 })
}

/** Convenience: require admin role specifically */
export async function requireAdmin(req: NextRequest): Promise<{ ok: true; role: string } | NextResponse> {
  return requirePermission(req, 'settings:write')
}
