import type { RequestHandler } from './$types';
import { PUBLIC_API_BASE } from '$env/static/public';

export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'Content-Type'
    }
  });
};

export const GET: RequestHandler = async ({ params }) => {
  const filename = params.filename;
  
  if (!filename) {
    return new Response('Filename required', { status: 400 });
  }

  try {
    // Construct the backend file path
    // Assuming files are in cadmodels/output/ on the backend
    const filePath = `cadmodels/output/${filename}`;
    const fileUrl = `${PUBLIC_API_BASE}/${filePath}`;
    
    const r = await fetch(fileUrl);
    
    if (!r.ok) {
      return new Response('File not found', { status: 404 });
    }

    const blob = await r.blob();
    
    // Serve with appropriate content type for STEP files (viewing, not download)
    // Add CORS headers to allow iframe embedding
    return new Response(blob, {
      headers: {
        'content-type': 'application/octet-stream',
        'cache-control': 'public, max-age=3600',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, OPTIONS',
        'access-control-allow-headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new Response('Error serving file', { status: 500 });
  }
};

