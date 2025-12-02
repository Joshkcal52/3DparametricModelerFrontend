import type { RequestHandler } from './$types';
import { PUBLIC_API_BASE } from '$env/static/public';

const jsonHeaders = { 'content-type': 'application/json' };

const buildUrl = (name: string): string => {
  if (!name) {
    throw new Error('Preset name is required');
  }
  const sanitized = encodeURIComponent(name);
  return `${PUBLIC_API_BASE}/presets/${sanitized}`;
};

const relayResponse = async (r: Response) => {
  const payload = await r.text();
  return new Response(payload || '', {
    status: r.status,
    headers: {
      ...jsonHeaders,
      'content-type': r.headers.get('content-type') || 'application/json'
    }
  });
};

export const GET: RequestHandler = async ({ params }) => {
  try {
    const url = buildUrl(params.name || '');
    const r = await fetch(url);
    return relayResponse(r);
  } catch (error) {
    console.error('Preset fetch proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to load preset' }), {
      status: 500,
      headers: jsonHeaders
    });
  }
};

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const url = buildUrl(params.name || '');
    const body = await request.text();
    const r = await fetch(url, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body
    });
    return relayResponse(r);
  } catch (error) {
    console.error('Preset save proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save preset' }), {
      status: 500,
      headers: jsonHeaders
    });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const url = buildUrl(params.name || '');
    const r = await fetch(url, { method: 'DELETE' });
    return relayResponse(r);
  } catch (error) {
    console.error('Preset delete proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete preset' }), {
      status: 500,
      headers: jsonHeaders
    });
  }
};


