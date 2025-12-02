import type { RequestHandler } from './$types';
import { PUBLIC_API_BASE } from '$env/static/public';

const SAFE_FILENAME_REGEX = /^[A-Za-z0-9._-]+$/;

const resolveBackendUrl = (filename: string, origin: string): string => {
  const sanitized = filename.replace(/^\/+/, '');
  const base = PUBLIC_API_BASE.startsWith('http')
    ? new URL(PUBLIC_API_BASE)
    : new URL(PUBLIC_API_BASE.startsWith('/') ? PUBLIC_API_BASE : `/${PUBLIC_API_BASE}`, origin);
  return new URL(`cadmodels/output/${sanitized}`, base).href;
};

export const GET: RequestHandler = async ({ params, fetch, url }) => {
  const { filename } = params;

  if (!filename || !SAFE_FILENAME_REGEX.test(filename)) {
    return new Response('Invalid filename', { status: 400 });
  }

  const backendUrl = resolveBackendUrl(filename, url.origin);

  try {
    const backendResponse = await fetch(backendUrl);

    if (!backendResponse.ok) {
      const message = await backendResponse.text();
      return new Response(message || 'Failed to fetch file', {
        status: backendResponse.status
      });
    }

    const headers = new Headers();
    headers.set('content-type', backendResponse.headers.get('content-type') ?? 'application/octet-stream');
    const cd = backendResponse.headers.get('content-disposition');
    if (cd) {
      headers.set('content-disposition', cd);
    } else {
      headers.set('content-disposition', `attachment; filename="${filename}"`);
    }

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers
    });
  } catch (err) {
    console.error('File proxy error:', err);
    return new Response('Failed to proxy file request', { status: 500 });
  }
};

