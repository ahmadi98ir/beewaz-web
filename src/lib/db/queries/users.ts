import { eq } from 'drizzle-orm'
import { db } from '../index'
import { users, type NewUser } from '../schema'

export async function getUserByPhone(phone: string) {
  return db.query.users.findFirst({
    where: eq(users.phone, phone),
  })
}

export async function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { passwordHash: false }, // هرگز هش رمز برنگردانده نمی‌شود
  })
}

export async function createUser(data: NewUser) {
  const [user] = await db.insert(users).values(data).returning({
    id: users.id,
    phone: users.phone,
    email: users.email,
    fullName: users.fullName,
    role: users.role,
    isVerified: users.isVerified,
    createdAt: users.createdAt,
  })
  return user
}

export async function verifyUser(id: string) {
  const [user] = await db
    .update(users)
    .set({ isVerified: true, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning({ id: users.id, isVerified: users.isVerified })
  return user
}
