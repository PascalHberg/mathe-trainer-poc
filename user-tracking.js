/**
 * User Tracking Module
 * Handles client-side user session and online status tracking
 */

class UserTracker {
  constructor(config = {}) {
    this.config = {
      trackingEndpoint: config.trackingEndpoint || '/api/track-user',
      heartbeatInterval: config.heartbeatInterval || 30000, // 30 seconds
      idleTimeout: config.idleTimeout || 600000, // 10 minutes
      userId: config.userId || this.generateUserId(),
      sessionId: config.sessionId || this.generateSessionId(),
      ...config
    };

    this.isOnline = navigator.onLine;
    this.lastActivity = Date.now();
    this.heartbeatTimer = null;
    this.idleTimer = null;
    this.initialized = false;

    this.init();
  }

  /**
   * Initialize tracking
   */
  init() {
    // Track online/offline status
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Track user activity
    document.addEventListener('click', () => this.handleActivity());
    document.addEventListener('keypress', () => this.handleActivity());
    document.addEventListener('mousemove', () => this.handleActivity());
    document.addEventListener('scroll', () => this.handleActivity());

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.handleActivity();
      } else {
        this.handleInactive();
      }
    });

    // Heartbeat
    this.startHeartbeat();

    // Clean up on page leave
    window.addEventListener('beforeunload', () => this.logout());

    this.initialized = true;
    console.log('[UserTracker] Initialized for user:', this.config.userId);
  }

  /**
   * Start heartbeat to keep session alive
   */
  startHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.isOnline && document.visibilityState === 'visible') {
        this.sendHeartbeat();
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Send heartbeat to server
   */
  async sendHeartbeat() {
    try {
      const response = await fetch(this.config.trackingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.config.userId,
          action: 'heartbeat',
          sessionId: this.config.sessionId,
          data: {
            lastActivity: this.lastActivity,
            isVisible: document.visibilityState === 'visible',
            url: window.location.href
          }
        })
      });

      if (!response.ok) {
        console.warn('[UserTracker] Heartbeat failed:', response.status);
      }
    } catch (error) {
      console.error('[UserTracker] Heartbeat error:', error);
    }
  }

  /**
   * Handle user activity
   */
  handleActivity() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;

    // Only update if more than 5 seconds have passed
    if (timeSinceLastActivity > 5000) {
      this.lastActivity = now;
      
      if (this.idleTimer) {
        clearTimeout(this.idleTimer);
      }

      // Set idle timer
      this.idleTimer = setTimeout(() => {
        this.handleInactive();
      }, this.config.idleTimeout);
    }
  }

  /**
   * Handle user goes inactive/idle
   */
  handleInactive() {
    console.log('[UserTracker] User became idle');
  }

  /**
   * Handle browser online
   */
  handleOnline() {
    this.isOnline = true;
    console.log('[UserTracker] Browser online');
    this.sendHeartbeat();
  }

  /**
   * Handle browser offline
   */
  handleOffline() {
    this.isOnline = false;
    console.log('[UserTracker] Browser offline');
  }

  /**
   * Logout and end session
   */
  async logout() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    try {
      await fetch(this.config.trackingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.config.userId,
          action: 'logout',
          sessionId: this.config.sessionId
        })
      });
    } catch (error) {
      console.error('[UserTracker] Logout error:', error);
    }
  }

  /**
   * Generate unique user ID
   */
  generateUserId() {
    let userId = localStorage.getItem('mathtrainer_userId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('mathtrainer_userId', userId);
    }
    return userId;
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current tracking status
   */
  getStatus() {
    return {
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      isOnline: this.isOnline,
      isIdle: Date.now() - this.lastActivity > this.config.idleTimeout,
      lastActivity: this.lastActivity,
      initialized: this.initialized
    };
  }

  /**
   * Check user online status with server
   */
  async checkStatus() {
    try {
      const response = await fetch(
        `${this.config.trackingEndpoint}?userId=${this.config.userId}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[UserTracker] Status check error:', error);
      return null;
    }
  }
}

// Export for use
window.UserTracker = UserTracker;
