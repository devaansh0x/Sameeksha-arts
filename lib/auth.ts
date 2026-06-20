// Barrel — re-exports all auth helpers so API routes can use '@/lib/auth'
export { getSession, getCurrentUser, isAuthenticated, hashPassword, verifyPassword } from '@/lib/auth/auth'
