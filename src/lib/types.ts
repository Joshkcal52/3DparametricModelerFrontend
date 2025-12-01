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

export interface MaterialsResponse {
  materials: Record<string, { name: string; density_lb_ft3?: number; [k: string]: any }>;
}



