import type { RequestHandler } from './$types';
import { PUBLIC_API_BASE } from '$env/static/public';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.text();
  const r = await fetch(`${PUBLIC_API_BASE}/generate-step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });

  const contentType = r.headers.get('content-type') || '';
  
  // If backend returns JSON with download info, return it
  if (contentType.includes('application/json')) {
    const data = await r.json();
    
    // If backend provides a file path, convert it to a public URL for viewing
    if (data.file_path || data.path) {
      const filePath = data.file_path || data.path;
      const filename = data.filename || filePath.split('/').pop() || 'tank.step';
      
      // Return public URL for viewer and download
      // The viewer can access /generated/<filename> and download uses /api/download-step
      return new Response(JSON.stringify({
        download_url: `/api/download-step?path=${encodeURIComponent(filePath.startsWith('/') ? filePath : `/${filePath}`)}`,
        view_url: `/generated/${filename}`,
        filename: filename
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    // If backend already provides download_url, pass it through
    return new Response(JSON.stringify(data), {
      status: r.status,
      headers: { 'content-type': 'application/json' }
    });
  }

  // Otherwise, pass through file stream (fallback)
  const headers = new Headers();
  if (contentType) headers.set('content-type', contentType);
  const cd = r.headers.get('content-disposition');
  if (cd) headers.set('content-disposition', cd);

  return new Response(r.body, { status: r.status, headers });
};



