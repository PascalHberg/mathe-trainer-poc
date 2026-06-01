/**
 * Vercel Serverless Function - User Online Tracking
 * Tracks active users and maintains user session data
 */

const activeUsers = new Map();
const SESSION_TIMEOUT = parseInt(process.env.USER_SESSION_TIMEOUT) || 1800000; // 30 mins

/**
 * GET: Check if user is online
 * POST: Update user online status
 */
export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      return handlePostRequest(req, res);
    } else if (req.method === 'GET') {
      return handleGetRequest(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Tracking error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.DEBUG_MODE ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle POST: Register or update user online status
 */
function handlePostRequest(req, res) {
  const { userId, action, sessionId, data } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const now = Date.now();
  const userKey = `user_${userId}`;

  if (action === 'heartbeat' || action === 'update') {
    // Update existing user session
    activeUsers.set(userKey, {
      userId,
      sessionId: sessionId || generateSessionId(),
      lastSeen: now,
      ip: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      ...data
    });

    return res.status(200).json({
      status: 'online',
      message: 'User session updated',
      timestamp: now,
      sessionId: activeUsers.get(userKey).sessionId
    });
  }

  if (action === 'logout' || action === 'disconnect') {
    // Remove user from active users
    activeUsers.delete(userKey);
    return res.status(200).json({
      status: 'offline',
      message: 'User session ended',
      timestamp: now
    });
  }

  return res.status(400).json({ error: 'Invalid action' });
}

/**
 * Handle GET: Retrieve user online status or active users count
 */
function handleGetRequest(req, res) {
  const { userId, stats } = req.query;

  // Cleanup expired sessions
  cleanupExpiredSessions();

  if (stats === 'true') {
    // Return aggregated stats
    return res.status(200).json({
      activeUsers: activeUsers.size,
      timestamp: Date.now(),
      users: Array.from(activeUsers.values()).map(user => ({
        userId: user.userId,
        lastSeen: user.lastSeen,
        sessionDuration: Date.now() - user.lastSeen
      }))
    });
  }

  if (userId) {
    // Check specific user status
    const userKey = `user_${userId}`;
    const user = activeUsers.get(userKey);

    if (user) {
      const isStale = (Date.now() - user.lastSeen) > SESSION_TIMEOUT;
      
      if (isStale) {
        activeUsers.delete(userKey);
        return res.status(200).json({
          status: 'offline',
          message: 'Session expired',
          userId
        });
      }

      return res.status(200).json({
        status: 'online',
        userId,
        lastSeen: user.lastSeen,
        sessionDuration: Date.now() - user.lastSeen,
        sessionId: user.sessionId
      });
    }

    return res.status(200).json({
      status: 'offline',
      userId,
      message: 'User not found in active sessions'
    });
  }

  // Return overall stats if no specific user
  return res.status(200).json({
    activeUsers: activeUsers.size,
    timestamp: Date.now()
  });
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, user] of activeUsers.entries()) {
    if ((now - user.lastSeen) > SESSION_TIMEOUT) {
      activeUsers.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0 && process.env.DEBUG_MODE) {
    console.log(`Cleaned up ${cleaned} expired sessions`);
  }
}

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
