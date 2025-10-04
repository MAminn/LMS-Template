import type { FileUploadConfig, SystemConfig } from "@/shared/types/global";

/**
 * Environment variable validation
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Application configuration
 */
export const config = {
  /**
   * Database configuration
   */
  database: {
    url: requireEnv("DATABASE_URL"),
  },

  /**
   * Authentication configuration
   */
  auth: {
    secret: requireEnv("NEXTAUTH_SECRET"),
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
  },

  /**
   * File upload configuration
   */
  upload: {
    images: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      maxFiles: 1,
    } as FileUploadConfig,

    documents: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      maxFiles: 5,
    } as FileUploadConfig,

    videos: {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ["video/mp4", "video/webm", "video/ogg"],
      maxFiles: 1,
    } as FileUploadConfig,
  },

  /**
   * Email configuration
   */
  email: {
    from: process.env.EMAIL_FROM || "noreply@theacademy.com",
    provider: process.env.EMAIL_PROVIDER || "console", // 'smtp', 'sendgrid', 'console'
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
  },

  /**
   * Payment configuration
   */
  payments: {
    stripe: {
      publicKey: process.env.STRIPE_PUBLIC_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    currency: "USD",
    commission: 0.05, // 5% platform commission
  },

  /**
   * Rate limiting
   */
  rateLimit: {
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // requests per window
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // login attempts per window
    },
  },

  /**
   * System settings
   */
  system: {
    siteName: "The Academy",
    siteUrl: process.env.SITE_URL || "http://localhost:3000",
    supportEmail: process.env.SUPPORT_EMAIL || "support@theacademy.com",
    features: {
      analytics: process.env.ENABLE_ANALYTICS === "true",
      customBranding: process.env.ENABLE_CUSTOM_BRANDING === "true",
      advancedReporting: process.env.ENABLE_ADVANCED_REPORTING === "true",
      sso: process.env.ENABLE_SSO === "true",
      api: process.env.ENABLE_API === "true",
    },
  } as SystemConfig,

  /**
   * Development settings
   */
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  /**
   * Logging configuration
   */
  logging: {
    level: process.env.LOG_LEVEL || "info",
    enableConsole: process.env.NODE_ENV !== "production",
  },

  /**
   * Cache configuration
   */
  cache: {
    redis: {
      url: process.env.REDIS_URL,
    },
    ttl: {
      default: 5 * 60, // 5 minutes
      long: 60 * 60, // 1 hour
      short: 60, // 1 minute
    },
  },
} as const;

/**
 * Type-safe config access
 */
export type Config = typeof config;
