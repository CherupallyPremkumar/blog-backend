export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),

  // Production URL for generating correct asset links
  url: env('PUBLIC_URL', `http://localhost:${env.int('PORT', 1337)}`),

  app: {
    keys: env.array('APP_KEYS'),
  },

  // Proxy configuration for production (behind nginx, load balancer, etc.)
  proxy: env.bool('TRUST_PROXY', false),

  // Request body size limits
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
