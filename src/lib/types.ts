export type RoofType = 'flat' | 'cone';

export interface ManwaySpec {
  width: number;
  height: number;
  offset_up?: number; // default 18.0
  corner_radius?: number; // default 2
}

export interface TankParams {
  diameter: number;
  height: number;
  wall_thickness?: number; // default 0.25
  bottom_thickness?: number; // default 0.25
  roof_type?: RoofType; // default 'flat'
  roof_thickness?: number; // default 0.25
  roof_slope?: number; // default 0.5
  manway?: ManwaySpec | null;
  material_key?: string | null; // NEW
}

export interface LineItem {
  label: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface QuoteResult {
  material_lb: number;
  material_cost: number;
  labor_cost: number;
  adders_cost: number;
  subtotal: number;
  total: number;
  currency: string; // 'USD'
  outer_radius: number;
  inner_radius: number;
  weld_inches: number;
  material_key: string;
  line_items: LineItem[];
}

export interface MaterialDefinition {
  name: string;
  density_lb_ft3?: number;
  density_lb_per_in3?: number;
  [k: string]: string | number | boolean | null | undefined;
}

export type MaterialMap = Record<string, MaterialDefinition>;

export interface MaterialsResponse {
  materials: MaterialMap;
}

export interface MaterialPricing {
  density_lb_per_in3: number;
  price_per_lb: number;
  [k: string]: string | number | boolean | null | undefined;
}

export interface LaborPricing {
  weld_dollars_per_inch: number;
  weld_passes_per_joint: number;
  assembly_hours: number;
  shop_rate_per_hour: number;
}

export interface PricingAdders {
  overhead_pct: number;
  profit_pct: number;
  paint_pct: number;
}

export interface PricingDefaults {
  material_key: string;
}

export interface PricingConfig {
  materials: Record<string, MaterialPricing>;
  labor: LaborPricing;
  adders: PricingAdders;
  defaults: PricingDefaults;
}

export interface Preset {
  name: string;
  params: TankParams;
}

export type PresetMap = Record<string, TankParams>;

export interface PresetListResponse {
  presets: PresetMap;
}

export interface PresetResponse {
  name: string;
  params: TankParams;
}




