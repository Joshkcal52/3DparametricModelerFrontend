import type { RequestHandler } from './$types';
import { PUBLIC_API_BASE } from '$env/static/public';

const SAFE_FILENAME_REGEX = /^[A-Za-z0-9._-]+$/;

const corsHeaders = (origin: string) => ({
  'access-control-allow-origin': origin,
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'Content-Type'
});

const buildFileUrl = (filename: string, origin: string): string => {
  const sanitizedFilename = filename.replace(/^\/+/, '');
  const base = PUBLIC_API_BASE.startsWith('http')
    ? new URL(PUBLIC_API_BASE)
    : new URL(PUBLIC_API_BASE.startsWith('/') ? PUBLIC_API_BASE : `/${PUBLIC_API_BASE}`, origin);
  return new URL(`cadmodels/output/${sanitizedFilename}`, base).href;
};

export const OPTIONS: RequestHandler = async ({ url }) => {
  return new Response(null, { headers: corsHeaders(url.origin) });
};

export const GET: RequestHandler = async ({ params, url }) => {
  const { filename } = params;

  if (!filename || !SAFE_FILENAME_REGEX.test(filename)) {
    return new Response('Invalid filename', {
      status: 400,
      headers: corsHeaders(url.origin)
    });
  }

  const headers = corsHeaders(url.origin);

  try {
    const fileUrl = buildFileUrl(filename, url.origin);
    const r = await fetch(fileUrl);

    if (!r.ok) {
      return new Response('File not found', { status: 404, headers });
    }

    const blob = await r.blob();

    return new Response(blob, {
      headers: {
        ...headers,
        'content-type': 'application/octet-stream',
        'cache-control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new Response('Error serving file', { status: 500, headers });
  }
};
