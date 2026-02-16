/**
 * getMediaUrl — converts a relative media path from the Django backend
 * into a fully-qualified URL that the browser can load.
 *
 * Django returns photo fields as relative paths, e.g.:
 *   /media/staff/photos/abc123.jpg
 *
 * In production these are served by nginx at the same origin, so a relative
 * path works. But if VITE_API_BASE_URL points to a different origin (e.g.
 * http://localhost:8000 in dev), we need to prepend that origin.
 *
 * Usage:
 *   import { getMediaUrl } from '@/utils/mediaUrl';
 *   <img src={getMediaUrl(staff.photo)} />
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Extract just the origin (scheme + host) from the API base URL
// e.g. "http://localhost:8000/api/v1" → "http://localhost:8000"
// e.g. "/api/v1" (relative, same origin) → ""
const getApiOrigin = () => {
  try {
    const url = new URL(API_BASE, window.location.href);
    // If same origin as the page, no prefix needed
    if (url.origin === window.location.origin) return '';
    return url.origin;
  } catch {
    return '';
  }
};

export const getMediaUrl = (path) => {
  if (!path) return null;
  // Only process string paths — ignore File objects or anything non-string
  if (typeof path !== 'string') return null;
  // Already a full URL (http/https/blob/data)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const origin = getApiOrigin();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${cleanPath}`;
};
