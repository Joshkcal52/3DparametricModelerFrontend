import type { RequestHandler } from './$types';
import { PUBLIC_API_BASE } from '$env/static/public';

export const GET: RequestHandler = async () => {
  // Try multiple endpoints, similar to materials endpoint
  const candidates = [
    `${PUBLIC_API_BASE}/pricing`,
    `${PUBLIC_API_BASE}/cadmodels/pricing/pricing.json`
  ];

  let lastError: unknown = null;
  for (const url of candidates) {
    try {
      const r = await fetch(url);
      if (r.ok && r.headers.get('content-type')?.includes('application/json')) {
        const data = await r.json();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
    } catch (e) {
      lastError = e;
    }
  }

  // Return error if not found
  console.error('Pricing fetch error:', lastError);
  return new Response(JSON.stringify({ error: 'Pricing not found' }), {
    status: 404,
    headers: { 'content-type': 'application/json' }
  });
};

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const body = await request.text();
    const r = await fetch(`${PUBLIC_API_BASE}/pricing`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    if (!r.ok) {
      const error = await r.text();
      return new Response(JSON.stringify({ error: error || 'Failed to update pricing' }), {
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
    console.error('Pricing update error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update pricing' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};

