import type { RequestHandler } from './$types';
import { PUBLIC_API_BASE } from '$env/static/public';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.text();
    const r = await fetch(`${PUBLIC_API_BASE}/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    if (!r.ok) {
      const errorText = await r.text();
      console.error('Backend quote error:', r.status, errorText);
      return new Response(JSON.stringify({ error: errorText || 'Failed to fetch quote' }), {
        status: r.status,
        headers: { 'content-type': 'application/json' }
      });
    }

    const data = await r.json();
    
    return new Response(JSON.stringify(data), {
      status: r.status,
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Quote proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch quote' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};



