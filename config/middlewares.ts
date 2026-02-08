export default ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      // Strict origin validation
      origin: (ctx) => {
        const allowedOrigins = env('CORS_ORIGINS', 'http://localhost:3000')
          .split(',')
          .map(url => url.trim())
          .filter(url => url.length > 0);

        const requestOrigin = ctx.request.header.origin;

        // Allow if origin is in whitelist
        if (allowedOrigins.includes(requestOrigin)) {
          return requestOrigin;
        }

        // Log unauthorized attempts in production
        if (env('NODE_ENV') === 'production' && requestOrigin) {
          console.warn(`[CORS] Blocked request from unauthorized origin: ${requestOrigin}`);
        }

        // Block all other origins
        return false;
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      credentials: true,
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
