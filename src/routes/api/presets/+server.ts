import type { RequestHandler } from './$types';
import { PUBLIC_API_BASE } from '$env/static/public';

const jsonHeaders = { 'content-type': 'application/json' };

export const GET: RequestHandler = async () => {
  try {
    const r = await fetch(`${PUBLIC_API_BASE}/presets`, {
      headers: { 'content-type': 'application/json' }
    });
    const payload = await r.text();

    if (!r.ok) {
      console.error('Preset list error:', r.status, payload);
      return new Response(payload || JSON.stringify({ error: 'Failed to load presets' }), {
        status: r.status,
        headers: jsonHeaders
      });
    }

    return new Response(payload || JSON.stringify({ presets: {} }), {
      status: 200,
      headers: jsonHeaders
    });
  } catch (error) {
    console.error('Preset list proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to load presets' }), {
      status: 500,
      headers: jsonHeaders
    });
  }
};


