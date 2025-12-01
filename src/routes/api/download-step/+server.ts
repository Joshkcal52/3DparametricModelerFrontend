import type { RequestHandler } from './$types';
import { PUBLIC_API_BASE } from '$env/static/public';

export const GET: RequestHandler = async ({ url }) => {
  const filePath = url.searchParams.get('path');
  
  if (!filePath) {
    return new Response('File path required', { status: 400 });
  }

  try {
    // Fetch the file from the backend
    // If the backend serves files at a specific endpoint, construct the URL
    // Otherwise, try to fetch from the file path directly
    const fileUrl = filePath.startsWith('http') 
      ? filePath 
      : `${PUBLIC_API_BASE}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
    
    const r = await fetch(fileUrl);
    
    if (!r.ok) {
      return new Response('File not found', { status: 404 });
    }

    const blob = await r.blob();
    const filename = filePath.split('/').pop() || 'tank.step';
    
    return new Response(blob, {
      headers: {
        'content-type': 'application/octet-stream',
        'content-disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return new Response('Error downloading file', { status: 500 });
  }
};

