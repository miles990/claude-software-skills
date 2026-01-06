/**
 * Helmet.js Security Configuration Template
 * Usage: Import and use with Express
 *
 * npm install helmet
 */

import helmet from 'helmet';

/**
 * Production-ready Helmet configuration
 * Includes all recommended security headers
 */
export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Remove unsafe-inline in production
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },

  // Cross-Origin settings
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },

  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },

  // Frameguard (clickjacking protection)
  frameguard: { action: 'deny' },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // IE No Open
  ieNoOpen: true,

  // No Sniff (MIME type sniffing protection)
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Permitted Cross-Domain Policies
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },

  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // XSS Filter
  xssFilter: true,
});

/**
 * Development configuration (relaxed CSP)
 */
export const helmetDevConfig = helmet({
  contentSecurityPolicy: false, // Disabled for development
  crossOriginEmbedderPolicy: false,
});

/**
 * Example Express usage:
 *
 * import express from 'express';
 * import { helmetConfig, helmetDevConfig } from './helmet-config.js';
 *
 * const app = express();
 *
 * if (process.env.NODE_ENV === 'production') {
 *   app.use(helmetConfig);
 * } else {
 *   app.use(helmetDevConfig);
 * }
 */
