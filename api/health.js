/**
 * Vercel Serverless Function - Health Check
 * Used for monitoring app status and availability
 */

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0-poc',
    checks: {
      api: 'operational',
      tracking: process.env.TRACKING_ENABLED === 'true' ? 'enabled' : 'disabled',
      services: {
        userTracking: 'available',
        analytics: 'available'
      }
    }
  };

  res.status(200).json(health);
}
