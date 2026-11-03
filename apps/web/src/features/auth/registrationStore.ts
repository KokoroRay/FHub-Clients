/**
 * Ephemeral In-Memory Store for User Registration Flow
 * 
 * SECURITY COMPLIANCE (Audit R03 & R05):
 * - Keeps sensitive registration credentials (password) strictly in JavaScript runtime RAM.
 * - NEVER persists sensitive registration data to Web Storage (localStorage/sessionStorage).
 * - NEVER leaks credentials into browser history state (history.state / React Router location.state).
 * - Self-expires in 15 minutes or cleans up immediately upon registration completion / abort.
 */

export interface PendingRegistration {
  fullName: string;
  email: string;
  password?: string;
  studentCode?: string;
  campus?: string;
  timestamp: number;
}

let ephemeralRegistration: PendingRegistration | null = null;

export const setPendingRegistration = (
  data: Omit<PendingRegistration, 'timestamp'>
): void => {
  ephemeralRegistration = {
    ...data,
    timestamp: Date.now(),
  };
};

export const getPendingRegistration = (): PendingRegistration | null => {
  if (!ephemeralRegistration) return null;
  // Automatically invalidate in-flight registration state after 15 minutes
  if (Date.now() - ephemeralRegistration.timestamp > 15 * 60 * 1000) {
    ephemeralRegistration = null;
    return null;
  }
  return ephemeralRegistration;
};

export const clearPendingRegistration = (): void => {
  ephemeralRegistration = null;
};
