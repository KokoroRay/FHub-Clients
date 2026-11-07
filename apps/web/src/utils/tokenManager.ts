/**
 * FHub Unified Token & Session Expiration Manager
 *
 * Implements security compliance:
 * 1. Automatic logout when access or refresh token expires.
 * 2. Regular user (Student) persistent session without arbitrary 1-day forced expiration.
 * 3. Operator / Staff / Admin sessions strictly enforced to 1-day (24-hour) maximum lifespan.
 */

// Maximum lifespan for operator sessions: exactly 1 day (24 hours)
export const OPERATOR_MAX_SESSION_MS = 24 * 60 * 60 * 1000;

export type LogoutReason = 'TOKEN_EXPIRED' | 'OPERATOR_EXPIRED_1_DAY' | 'UNAUTHORIZED' | 'MANUAL';

/**
 * Safely parse a JWT payload without external dependencies
 */
export function parseJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if the given user or token belongs to an operational / staff / admin role
 */
export function isOperatorAccount(user?: any, token?: string): boolean {
  // 1. Check subdomain context: ops.fhub.com.vn or admin.fhub.com.vn
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname.toLowerCase();
    if (host.startsWith('ops.') || host.startsWith('admin.')) {
      return true;
    }
  }

  // 2. Check user object role & properties
  if (user) {
    const role = String(user.role || '').toLowerCase();
    if (
      role.includes('admin') ||
      role.includes('staff') ||
      role.includes('moderator') ||
      role.includes('representative')
    ) {
      return true;
    }
    if (user.isStaff === true || user.is_staff === true || user.is_staff === 'true') {
      return true;
    }
  }

  // 3. Check active token payload claims
  const activeToken =
    token ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('fhub_token') || sessionStorage.getItem('fhub_token')
      : null);

  if (activeToken) {
    const payload = parseJwtPayload(activeToken);
    if (payload) {
      const pRole = String(payload.role || '').toLowerCase();
      if (
        pRole.includes('admin') ||
        pRole.includes('staff') ||
        pRole.includes('moderator') ||
        pRole.includes('representative')
      ) {
        return true;
      }
      if (payload.is_staff === true || payload.is_staff === 'true' || payload.staff_id != null) {
        return true;
      }
    }
  }

  // 4. Check stored operator flag
  if (typeof window !== 'undefined') {
    if (
      localStorage.getItem('fhub_is_operator') === 'true' ||
      sessionStorage.getItem('fhub_is_operator') === 'true'
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Determine if an operator session has exceeded the 1-day (24 hours) maximum lifespan
 */
export function isOperatorSessionExpired(): boolean {
  if (typeof window === 'undefined') return false;

  const isOp =
    localStorage.getItem('fhub_is_operator') === 'true' ||
    sessionStorage.getItem('fhub_is_operator') === 'true' ||
    isOperatorAccount();

  if (!isOp) return false;

  const rawLoginAt =
    localStorage.getItem('fhub_login_at') || sessionStorage.getItem('fhub_login_at');

  if (!rawLoginAt) return false;

  const loginAt = Number(rawLoginAt);
  if (isNaN(loginAt) || loginAt <= 0) return false;

  return Date.now() - loginAt >= OPERATOR_MAX_SESSION_MS;
}

/**
 * Check if a JWT token has expired or is about to expire within `skewSeconds`
 */
export function isTokenExpired(token: string, skewSeconds: number = 0): boolean {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;

  const expirationMs = payload.exp * 1000;
  return Date.now() + skewSeconds * 1000 >= expirationMs;
}

/**
 * Record a fresh login timestamp and operator security flag
 */
export function recordLoginSession(user: any, token?: string, rememberMe: boolean = true): void {
  if (typeof window === 'undefined') return;

  const targetStorage = rememberMe ? localStorage : sessionStorage;
  const oppositeStorage = rememberMe ? sessionStorage : localStorage;

  const nowMs = Date.now().toString();
  const isOp = isOperatorAccount(user, token);

  targetStorage.setItem('fhub_login_at', nowMs);
  oppositeStorage.removeItem('fhub_login_at');

  if (isOp) {
    targetStorage.setItem('fhub_is_operator', 'true');
    oppositeStorage.removeItem('fhub_is_operator');
  } else {
    localStorage.removeItem('fhub_is_operator');
    sessionStorage.removeItem('fhub_is_operator');
  }
}

/**
 * Wipe all authentication tokens, session timestamps, and user data from browser storage
 */
export function clearAllAuthTokens(): void {
  if (typeof window === 'undefined') return;

  const keys = [
    'fhub_token',
    'fhub_refresh_token',
    'fhub_user',
    'fhub_login_at',
    'fhub_is_operator',
    'fhub_chat_suggestions_dismissed',
  ];

  keys.forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

/**
 * Centralized automatic logout trigger.
 * Dispatches event to update React auth state and redirects cleanly.
 */
export function triggerAutoLogout(reason: LogoutReason = 'TOKEN_EXPIRED'): void {
  if (typeof window === 'undefined') return;

  const wasOperator =
    localStorage.getItem('fhub_is_operator') === 'true' ||
    sessionStorage.getItem('fhub_is_operator') === 'true' ||
    isOperatorAccount();

  clearAllAuthTokens();

  // Notify active listeners (AuthContext, RealtimeContext, etc.)
  try {
    window.dispatchEvent(new CustomEvent('fhub:auth:logout', { detail: { reason } }));
  } catch (e) {
    console.warn('Failed to dispatch fhub:auth:logout event:', e);
  }

  // Redirect to appropriate login screen
  const currentPath = window.location.pathname;
  const isSubdomain =
    window.location.hostname.startsWith('ops.') || window.location.hostname.startsWith('admin.');

  const reasonParam = reason === 'OPERATOR_EXPIRED_1_DAY' ? 'operator_expired' : 'session_expired';

  if (isSubdomain) {
    if (!currentPath.includes('/login')) {
      const redirectParam = encodeURIComponent(currentPath + window.location.search);
      window.location.href = `/login?reason=${reasonParam}&redirect=${redirectParam}`;
    }
  } else if (wasOperator || currentPath.startsWith('/admin') || currentPath.startsWith('/ops')) {
    if (!currentPath.includes('/login') && !currentPath.includes('/admin-login')) {
      const redirectParam = encodeURIComponent(currentPath + window.location.search);
      window.location.href = `/admin/login?reason=${reasonParam}&redirect=${redirectParam}`;
    }
  } else {
    // Regular student user: if on a protected route, navigate to landing with reason
    if (currentPath !== '/' && currentPath !== '/landing' && !currentPath.includes('/login')) {
      window.location.href = `/landing?reason=${reasonParam}`;
    }
  }
}
