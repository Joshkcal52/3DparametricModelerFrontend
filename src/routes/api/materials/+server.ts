import type { RequestHandler } from './$types';
import { PUBLIC_API_BASE } from '$env/static/public';

export const GET: RequestHandler = async () => {
  // Prefer new /materials endpoint, but keep older fallbacks for compatibility
  const candidates = [
    `${PUBLIC_API_BASE}/materials`,
    `${PUBLIC_API_BASE}/pricing`,
    `${PUBLIC_API_BASE}/cadmodels/pricing/pricing.json`
  ];

  let lastError: unknown = null;
  for (const url of candidates) {
    try {
      const r = await fetch(url);
      if (r.ok && r.headers.get('content-type')?.includes('application/json')) {
        const data = await r.json();
        // Normalize: { materials: {...} }
        if (data.materials) {
          return new Response(JSON.stringify({ materials: data.materials }), {
            headers: { 'content-type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ materials: data }), {
          headers: { 'content-type': 'application/json' }
        });
      }
    } catch (e) {
      lastError = e;
    }
  }

  // Return empty materials object instead of error - app can still function
  return new Response(JSON.stringify({ materials: {} }), { 
    status: 200, 
    headers: { 'content-type': 'application/json' } 
  });
};



