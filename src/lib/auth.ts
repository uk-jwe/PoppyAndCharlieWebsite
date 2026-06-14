import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  session: { expiresIn: 60 * 60 * 24 * 7 },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3006'],
  // Rate limiting — auto-enabled in production. Sign-in/sign-up have a stricter
  // built-in rule of 3 attempts per 10 s per IP (returns 429).
  // General endpoints: 100 req / 10 s. Storage is in-memory (resets on restart).
  // TODO: add Cloudflare WAF rate-limiting rule on /api/auth/* as a second layer.
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    storage: 'memory',
  },
})

export type Session = typeof auth.$Infer.Session
