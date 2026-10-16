/**
 * Operational Subdomain helper for FHub platform
 * Supports ops.fhub.com.vn, ops.localhost:5173, ?subdomain=ops query, and localStorage override
 */

export const isOpsSubdomain = (): boolean => {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname;
  const searchParams = new URLSearchParams(window.location.search);
  const subdomainParam = searchParams.get('subdomain');
  const storedSubdomain = localStorage.getItem('fhub_active_subdomain');

  // Check URL query param first (for easy local testing)
  if (subdomainParam === 'ops' || subdomainParam === 'admin') return true;
  if (subdomainParam === 'main') return false;

  // Check localStorage override
  if (storedSubdomain === 'ops' || storedSubdomain === 'admin') return true;

  // Check actual hostname (ops.fhub.com.vn or ops.localhost or admin.*)
  if (hostname.startsWith('ops.') || hostname.startsWith('admin.')) return true;

  return false;
};

// Backward compatibility alias
export const isAdminSubdomain = isOpsSubdomain;

export const setSubdomainMode = (mode: 'ops' | 'admin' | 'main'): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('fhub_active_subdomain', mode);

  // If on actual subdomain in production, redirect; else reload
  const url = new URL(window.location.href);
  url.searchParams.delete('subdomain');
  window.location.href = url.pathname === '/admin' || url.pathname.startsWith('/admin') ? '/' : url.toString();
};

