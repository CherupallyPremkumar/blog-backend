export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),

  // Production URL for generating correct asset links
  url: env('PUBLIC_URL'),

  app: {
    keys: env.array('APP_KEYS'),
  },

  // Proxy configuration for production (behind nginx, load balancer, etc.)
  proxy: env.bool('TRUST_PROXY', false),

  // Request body size limits (prevent memory exhaustion attacks)
  parser: {
    enabled: true,
    multipart: true,
    includeUnparsed: false,
    formLimit: '10mb',
    jsonLimit: '1mb',
    textLimit: '1mb',
    formidable: {
      maxFileSize: 10 * 1024 * 1024, // 10MB max file upload
    },
  },

  // Request timeout
  timeout: env.int('REQUEST_TIMEOUT', 30000),

  // Webhooks
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
