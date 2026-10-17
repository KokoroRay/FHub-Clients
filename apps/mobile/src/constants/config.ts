import { Platform } from 'react-native';

/**
 * FHub Mobile API Configuration
 * Supports 2 modes:
 * 1. GATEWAY MODE: All requests go through a unified API gateway (e.g. Ingress or Reverse Proxy at port 8080 or domain)
 * 2. DIRECT MICROSERVICE MODE: Routes requests directly to specific microservice ports (Identity: 5111, Content: 5121, etc.)
 */

// Host determination for development:
// - Android Emulator: 10.0.2.2 maps to host machine localhost
// - iOS Simulator / Web: localhost
// - Physical device: set to your machine's LAN IP (e.g. 192.168.1.10)
export const DEFAULT_DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const Config = {
  // Mode: 'gateway' | 'direct'
  mode: 'gateway' as 'gateway' | 'direct',

  // Gateway URL: Production backend domain matching current web FE (fhub.com.vn)
  gatewayUrl: 'https://api.fhub.com.vn',

  // Production domain
  prodGatewayUrl: 'https://api.fhub.com.vn',

  // Direct microservices port map (used when mode === 'direct' in local dev)
  services: {
    host: DEFAULT_DEV_HOST,
    identityPort: 5111,
    taxonomyPort: 5255,
    governancePort: 5249,
    contentPort: 5121,
    profilePort: 5267,
    interactionPort: 8081,
    communicationPort: 8082,
  },

  timeout: 15000,
};

/**
 * Resolves an API path (e.g., '/api/content/articles') to the actual URL
 */
export function resolveApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If running in gateway mode (or production), use gateway URL
  if (Config.mode === 'gateway') {
    return `${Config.gatewayUrl}${cleanPath}`;
  }

  // Direct microservices mode: map path prefix to microservice port
  const host = Config.services.host;

  if (cleanPath.startsWith('/api/auth') || cleanPath.startsWith('/api/identity') || cleanPath.startsWith('/api/users')) {
    return `http://${host}:${Config.services.identityPort}${cleanPath}`;
  }
  if (cleanPath.startsWith('/api/courses') || cleanPath.startsWith('/api/course-nodes') || cleanPath.startsWith('/api/campuses') || cleanPath.startsWith('/api/majors') || cleanPath.startsWith('/api/semantic-tags') || cleanPath.startsWith('/api/taxonomy')) {
    return `http://${host}:${Config.services.taxonomyPort}${cleanPath}`;
  }
  if (cleanPath.startsWith('/api/student/support-tickets') || cleanPath.startsWith('/api/support-tickets') || cleanPath.startsWith('/api/governance')) {
    return `http://${host}:${Config.services.governancePort}${cleanPath}`;
  }
  if (cleanPath.startsWith('/api/content') || cleanPath.startsWith('/api/articles') || cleanPath.startsWith('/api/workflows') || cleanPath.startsWith('/api/study-materials') || cleanPath.startsWith('/api/news')) {
    return `http://${host}:${Config.services.contentPort}${cleanPath}`;
  }
  if (cleanPath.startsWith('/api/profiles') || cleanPath.startsWith('/api/profile')) {
    return `http://${host}:${Config.services.profilePort}${cleanPath}`;
  }
  if (cleanPath.startsWith('/api/reputation') || cleanPath.startsWith('/api/badges') || cleanPath.startsWith('/api/interactions') || cleanPath.startsWith('/api/bookmarks')) {
    return `http://${host}:${Config.services.interactionPort}${cleanPath}`;
  }
  if (cleanPath.startsWith('/api/communication')) {
    return `http://${host}:${Config.services.communicationPort}${cleanPath}`;
  }

  // Default fallback
  return `${Config.gatewayUrl}${cleanPath}`;
}
