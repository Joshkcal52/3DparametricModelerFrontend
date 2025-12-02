import type { RequestHandler, RequestEvent } from '@sveltejs/kit';
import { PUBLIC_API_BASE } from '$env/static/public';

const HTTP_PATTERN = /^https?:\/\//i;
const SAFE_PATH_REGEX = /^\/[A-Za-z0-9/_\-.]+$/;

const corsHeaders = (origin: string) => ({
  'access-control-allow-origin': origin,
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'Content-Type'
});

const resolveBackendBase = (origin: string): string => {
  if (PUBLIC_API_BASE.startsWith('http')) {
    return PUBLIC_API_BASE;
  }

  const basePath = PUBLIC_API_BASE.startsWith('/') ? PUBLIC_API_BASE : `/${PUBLIC_API_BASE}`;
  return `${origin}${basePath}`;
};

const joinBackendPath = (base: string, path: string): string => {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${normalizedBase}${path}`;
};

const sanitizeRelativePath = (raw: string): string => {
  const normalized = `/${raw.replace(/^\/+/, '')}`;
  if (!SAFE_PATH_REGEX.test(normalized) || normalized.includes('..')) {
    throw new Error('Invalid file path');
  }
  return normalized;
};

const isAllowedAbsoluteUrl = (url: string, origin: string): boolean => {
  try {
    const target = new URL(url);
    const allowedOrigin = PUBLIC_API_BASE.startsWith('http')
      ? new URL(PUBLIC_API_BASE).origin
      : origin;
    return target.origin === allowedOrigin;
  } catch {
    return false;
  }
};

export const OPTIONS: RequestHandler = async (event: RequestEvent) => {
  const { url } = event;
  return new Response(null, { headers: corsHeaders(url.origin) });
};

export const GET: RequestHandler = async (event: RequestEvent) => {
  const { url } = event;
  const filePath = url.searchParams.get('path');

  if (!filePath) {
    return new Response('File path required', {
      status: 400,
      headers: corsHeaders(url.origin)
    });
  }

  const headers = corsHeaders(url.origin);

  try {
    let targetUrl: string;

    if (HTTP_PATTERN.test(filePath)) {
      if (!isAllowedAbsoluteUrl(filePath, url.origin)) {
        return new Response('Forbidden file path', { status: 403, headers });
      }
      targetUrl = filePath;
    } else {
      const sanitizedPath = sanitizeRelativePath(filePath);
      targetUrl = joinBackendPath(resolveBackendBase(url.origin), sanitizedPath);
    }

    const r = await fetch(targetUrl);

    if (!r.ok) {
      return new Response('File not found', { status: 404, headers });
    }

    const blob = await r.blob();
    const filename = filePath.split('/').pop() || 'tank.step';

    return new Response(blob, {
      headers: {
        ...headers,
        'content-type': 'application/octet-stream',
        'content-disposition': `attachment; filename="${filename.replace(/[^A-Za-z0-9._-]/g, '') || 'tank.step'}"`
      }
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return new Response('Error downloading file', { status: 500, headers });
  }
};
