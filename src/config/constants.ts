cat > src/utils/security.utils.ts << 'EOF'
/**
 * AMANAH GO - Security Utilities
 */

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function isValidCode(code: string): boolean {
  return /^\d{6}$/.test(code)
}

export function isCodeExpired(createdAt: string): boolean {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  return diffHours > 24
}

export function getJWTSecret(env: any): string {
  return env?.JWT_SECRET || process.env.JWT_SECRET || 'amanah-go-secret-key-change-in-production'
}
EOF