import { browser } from '$app/environment';
import { PUBLIC_API_BASE } from '$env/static/public';
import type { TankParams, QuoteResult, MaterialsResponse } from './types';

// Proxied endpoints (avoid CORS) under /api/*
const BASE = '/api';

export async function fetchMaterials(): Promise<MaterialsResponse> {
  const r = await fetch(`${BASE}/materials`);
  if (!r.ok) throw new Error('Failed to load materials');
  return r.json();
}

export async function requestQuote(body: TankParams): Promise<QuoteResult> {
  const r = await fetch(`${BASE}/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error('Quote failed');
  const data = await r.json();
  
  // Map backend line_items format to frontend format
  if (data.line_items && Array.isArray(data.line_items)) {
    data.line_items = data.line_items.map((item: any) => ({
      label: item.name || item.label || '-',
      qty: item.quantity ?? item.qty ?? 0,
      unit: item.uom || item.unit || '-',
      rate: item.unit_cost ?? item.rate ?? 0,
      amount: item.extended ?? item.amount ?? 0
    }));
  }
  
  return data;
}

/**
 * Generate STEP file. Backend should return JSON with:
 * - { file_path: "/path/to/file.step", filename: "file.step" } OR
 * - { download_url: "/api/download-step?path=...", filename: "file.step" }
 */
export async function fetchPricing(): Promise<any> {
  const r = await fetch(`${BASE}/pricing`);
  if (!r.ok) throw new Error('Failed to load pricing');
  return r.json();
}

export async function updatePricing(pricing: any): Promise<void> {
  const r = await fetch(`${BASE}/pricing`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pricing)
  });
  if (!r.ok) throw new Error('Failed to update pricing');
}

export async function generateStep(body: TankParams): Promise<{ href: string; filename?: string }> {
  const r = await fetch(`${BASE}/generate-step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    throw new Error('Failed to generate STEP file');
  }

  const ct = r.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const data = await r.json();
    const href: string = data.download_url || data.url || data.href || '';
    const filename: string | undefined = data.filename || undefined;
    
    if (!href) {
      throw new Error('Backend did not provide a download URL');
    }
    
    // Return the download URL (already processed by proxy)
    return { href, filename };
  }

  // Fallback: treat as file stream and build a blob URL
  const blob = await r.blob();
  const filename = (r.headers.get('content-disposition') || '').match(/filename="?([^";]+)"?/i)?.[1];
  const url = browser ? URL.createObjectURL(blob) : '';
  return { href: url, filename };
}



