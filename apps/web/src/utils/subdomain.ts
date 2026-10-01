/**
 * Subdomain helper for FHub platform
 * Supports admin.fhub.edu.vn, admin.localhost:5173, ?subdomain=admin query, and localStorage override
 */

export const isAdminSubdomain = (): boolean => {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname;
  const searchParams = new URLSearchParams(window.location.search);
  const subdomainParam = searchParams.get('subdomain');
  const storedSubdomain = localStorage.getItem('fhub_active_subdomain');

  // Check URL query param first (for easy local testing)
  if (subdomainParam === 'admin') return true;
  if (subdomainParam === 'main') return false;

  // Check localStorage override
  if (storedSubdomain === 'admin') return true;

  // Check actual hostname (admin.fhub.edu.vn or admin.localhost)
  if (hostname.startsWith('admin.')) return true;

  return false;
};

export const setSubdomainMode = (mode: 'admin' | 'main'): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('fhub_active_subdomain', mode);

  // If on actual subdomain in production, redirect; else reload
  const url = new URL(window.location.href);
  url.searchParams.delete('subdomain');
  window.location.href = url.pathname === '/admin' || url.pathname.startsWith('/admin') ? '/' : url.toString();
};
