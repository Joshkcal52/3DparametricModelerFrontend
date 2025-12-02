import { browser } from '$app/environment';
import { PUBLIC_API_BASE } from '$env/static/public';
import type {
  TankParams,
  QuoteResult,
  MaterialsResponse,
  PricingConfig,
  MaterialPricing
} from './types';

// Proxied endpoints (avoid CORS) under /api/*
const BASE = '/api';

type BackendLineItem = {
  name?: string;
  label?: string;
  quantity?: number;
  qty?: number;
  uom?: string;
  unit?: string;
  unit_cost?: number;
  rate?: number;
  extended?: number;
  amount?: number;
};

const DEFAULT_PRICING: PricingConfig = {
  materials: {},
  labor: {
    weld_dollars_per_inch: 0,
    weld_passes_per_joint: 0,
    assembly_hours: 0,
    shop_rate_per_hour: 0
  },
  adders: {
    overhead_pct: 0,
    profit_pct: 0,
    paint_pct: 0
  },
  defaults: {
    material_key: ''
  }
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const coerced = Number(value);
  return Number.isFinite(coerced) ? coerced : fallback;
};

const normalizeMaterialPricing = (entries: Record<string, unknown>): Record<string, MaterialPricing> => {
  const normalized: Record<string, MaterialPricing> = {};

  for (const [key, value] of Object.entries(entries)) {
    if (value && typeof value === 'object') {
      const material = value as Partial<MaterialPricing>;
      normalized[key] = {
        ...material,
        density_lb_per_in3: toNumber(material?.density_lb_per_in3),
        price_per_lb: toNumber(material?.price_per_lb)
      };
    }
  }

  return normalized;
};

const normalizePricingConfig = (raw: unknown): PricingConfig => {
  const data = (raw ?? {}) as Partial<PricingConfig>;
  const materialsSource =
    data.materials && typeof data.materials === 'object' ? (data.materials as Record<string, unknown>) : {};

  return {
    materials: normalizeMaterialPricing(materialsSource),
    labor: {
      weld_dollars_per_inch: toNumber(data.labor?.weld_dollars_per_inch),
      weld_passes_per_joint: toNumber(data.labor?.weld_passes_per_joint),
      assembly_hours: toNumber(data.labor?.assembly_hours),
      shop_rate_per_hour: toNumber(data.labor?.shop_rate_per_hour)
    },
    adders: {
      overhead_pct: toNumber(data.adders?.overhead_pct),
      profit_pct: toNumber(data.adders?.profit_pct),
      paint_pct: toNumber(data.adders?.paint_pct)
    },
    defaults: {
      material_key: data.defaults?.material_key ?? DEFAULT_PRICING.defaults.material_key
    }
  };
};

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
  const raw = await r.text();
  if (!r.ok) {
    let message = 'Quote failed';
    try {
      const errorData = JSON.parse(raw);
      message = errorData.error || message;
    } catch {
      message = raw || message;
    }
    throw new Error(message);
  }
  const data = JSON.parse(raw);
  
  // Map backend line_items format to frontend format
  if (data.line_items && Array.isArray(data.line_items)) {
    data.line_items = data.line_items.map((item: BackendLineItem) => ({
      label: item.name || item.label || '-',
      qty: item.quantity ?? item.qty ?? 0,
      unit: item.uom || item.unit || '-',
      rate: item.unit_cost ?? item.rate ?? 0,
      amount: item.extended ?? item.amount ?? 0
    }));
  }
  
  // Ensure all numeric fields are properly set (defensive check)
  const quote: QuoteResult = {
    material_lb: data.material_lb ?? 0,
    material_cost: data.material_cost ?? 0,
    labor_cost: data.labor_cost ?? 0,
    adders_cost: data.adders_cost ?? 0,
    subtotal: data.subtotal ?? 0,
    total: data.total ?? 0,
    currency: data.currency || 'USD',
    outer_radius: data.outer_radius ?? 0,
    inner_radius: data.inner_radius ?? 0,
    weld_inches: data.weld_inches ?? 0,
    material_key: data.material_key || '',
    line_items: data.line_items || []
  };
  
  return quote;
}

/**
 * Generate STEP file. Backend should return JSON with:
 * - { file_path: "/path/to/file.step", filename: "file.step" } OR
 * - { download_url: "/api/download-step?path=...", filename: "file.step" }
 */
export async function fetchPricing(): Promise<PricingConfig> {
  const r = await fetch(`${BASE}/pricing`);
  if (!r.ok) throw new Error('Failed to load pricing');
  const data = await r.json();
  return normalizePricingConfig(data);
}

export async function updatePricing(pricing: PricingConfig): Promise<void> {
  const r = await fetch(`${BASE}/pricing`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pricing)
  });
  if (!r.ok) throw new Error('Failed to update pricing');
}

type StepPayload = { href: string; viewUrl?: string; filename?: string };

export async function generateStep(body: TankParams): Promise<StepPayload> {
  const r = await fetch(`${BASE}/generate-step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const buffer = await r.arrayBuffer();
  const ct = r.headers.get('content-type') || '';

  if (!r.ok) {
    const message = ct.includes('application/json')
      ? (() => {
          try {
            const parsed = JSON.parse(new TextDecoder().decode(buffer)) as { error?: string };
            return parsed.error || 'Failed to generate STEP file';
          } catch {
            return 'Failed to generate STEP file';
          }
        })()
      : new TextDecoder().decode(buffer) || 'Failed to generate STEP file';
    throw new Error(message);
  }

  if (ct.includes('application/json')) {
    const data = JSON.parse(new TextDecoder().decode(buffer));
    const href: string = data.download_url || data.url || data.href || '';
    const viewUrl: string = data.view_url || href; // Use view_url for viewer, fallback to download_url
    const filename: string | undefined = data.filename || undefined;
    
    if (!href) {
      throw new Error('Backend did not provide a download URL');
    }
    
    // Return both download URL and view URL
    return { href, viewUrl, filename };
  }

  // Fallback: treat as file stream and build a blob URL
  const blob = new Blob([buffer], { type: ct || 'application/octet-stream' });
  const filename = (r.headers.get('content-disposition') || '').match(/filename="?([^";]+)"?/i)?.[1];
  if (!browser) {
    throw new Error('STEP download is only available in the browser');
  }
  const url = URL.createObjectURL(blob);
  return { href: url, viewUrl: url, filename };
}



