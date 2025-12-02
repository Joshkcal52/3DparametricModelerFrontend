<script lang="ts">
  import type { PricingConfig } from '$lib/types';
  import Tooltip from '$lib/components/Tooltip.svelte';

  export let pricing: PricingConfig;
  export let onSave: (p: PricingConfig) => Promise<void>;
  export let saving = false;

  let localPricing: PricingConfig = structuredClone(pricing);

  // Watch for pricing changes from parent
  $: localPricing = structuredClone(pricing);
$: {
  if (typeof localPricing.adders.paint === 'undefined') {
    localPricing.adders.paint = null;
  }
}

const DEFAULT_PAINT_PRICING = {
  price_per_gallon: 45,
  coverage_sqft_per_gallon: 350
};

let paintMode: 'percentage' | 'per-gallon' = localPricing.adders.paint ? 'per-gallon' : 'percentage';
$: paintMode = localPricing.adders.paint ? 'per-gallon' : 'percentage';

  function handleSave() {
  const payload = structuredClone(localPricing);
  if (paintMode === 'per-gallon') {
    payload.adders.paint_pct = undefined;
  } else {
    payload.adders.paint = null;
  }
  onSave(payload);
  }

  function addMaterial() {
    const newKey = `material_${Object.keys(localPricing.materials).length + 1}`;
    localPricing.materials[newKey] = {
      density_lb_per_in3: 0.283,
      price_per_lb: 1.1
    };
    localPricing = { ...localPricing }; // Trigger reactivity
  }

  function removeMaterial(key: string) {
    delete localPricing.materials[key];
    localPricing = { ...localPricing }; // Trigger reactivity
  }

function ensurePaintConfig() {
  if (!localPricing.adders.paint) {
    localPricing.adders.paint = structuredClone(DEFAULT_PAINT_PRICING);
  }
}

function setPaintMode(mode: 'percentage' | 'per-gallon') {
  if (mode === 'per-gallon') {
    ensurePaintConfig();
    localPricing.adders.paint_pct = undefined;
  } else {
    localPricing.adders.paint = null;
    localPricing.adders.paint_pct =
      typeof localPricing.adders.paint_pct === 'number' ? localPricing.adders.paint_pct : 0.05;
  }
  localPricing = { ...localPricing };
}

function renameMaterialKey(oldKey: string, rawValue: string) {
  const nextKey = rawValue.trim();
  if (!nextKey) {
    localPricing = { ...localPricing };
    return;
  }

  if (nextKey === oldKey) {
    return;
  }

  if (localPricing.materials[nextKey]) {
    alert('A material with that key already exists. Please choose another name.');
    localPricing = { ...localPricing };
    return;
  }

  const entries = Object.entries(localPricing.materials).map(([key, value]) =>
    key === oldKey ? [nextKey, value] : [key, value]
  );

  localPricing.materials = Object.fromEntries(entries);

  if (localPricing.defaults.material_key === oldKey) {
    localPricing.defaults.material_key = nextKey;
  }

  localPricing = { ...localPricing };
}
</script>

<div class="space-y-8">
  <!-- Materials Section -->
  <section class="card">
    <div class="mb-6 pb-6 border-b border-black/10">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <h2 class="text-2xl font-semibold text-black">Materials</h2>
            <Tooltip text="Each material entry defines density and $/lb for quoting and tank mass calculations. Rename keys to something meaningful (e.g., steel_A36)." />
          </div>
          <p class="text-sm text-zinc-600">Configure material densities and prices</p>
        </div>
        <button class="btn btn-outline" on:click={addMaterial}>
          + Add Material
        </button>
      </div>
    </div>

    <div class="space-y-6">
      {#each Object.entries(localPricing.materials || {}) as [key, material]}
        <div class="p-4 border border-black/10 rounded-lg">
          <div class="flex items-center justify-between gap-4 mb-4">
            <label class="flex flex-col gap-1 flex-1">
              <span class="text-sm font-medium text-black">Material key</span>
              <input
                class="input"
                type="text"
                value={key}
                on:change={(event) => renameMaterialKey(key, (event.target as HTMLInputElement).value)}
                placeholder="e.g. steel_A36"
              />
            </label>
            <button 
              class="text-sm text-red-600 hover:text-red-700 underline"
              on:click={() => removeMaterial(key)}
            >
              Remove
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="grid gap-2">
              <span class="text-sm font-medium text-black">Density (lb/in³)</span>
              <input 
                class="input" 
                type="number" 
                bind:value={localPricing.materials[key].density_lb_per_in3}
                step="any" 
                min="0" 
                placeholder="0.283"
              />
            </label>
            <label class="grid gap-2">
              <span class="text-sm font-medium text-black">Price per lb ($)</span>
              <input 
                class="input" 
                type="number" 
                bind:value={localPricing.materials[key].price_per_lb}
                step="any" 
                min="0" 
                placeholder="1.10"
              />
            </label>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Labor Section -->
  <section class="card">
    <div class="mb-6 pb-6 border-b border-black/10">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-semibold text-black">Labor</h2>
          <Tooltip text="Set shop labor assumptions for welding inches, number of passes, assembly hours, and hourly rate. Quotes scale these rates based on tank geometry." />
        </div>
        <p class="text-sm text-zinc-600">Configure welding and assembly labor rates</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <label class="grid gap-2">
        <span class="text-sm font-medium text-black">Weld dollars per inch ($)</span>
        <input 
          class="input" 
          type="number" 
          bind:value={localPricing.labor.weld_dollars_per_inch}
          step="any" 
          min="0" 
          placeholder="2.50"
        />
      </label>
      <label class="grid gap-2">
        <span class="text-sm font-medium text-black">Weld passes per joint</span>
        <input 
          class="input" 
          type="number" 
          bind:value={localPricing.labor.weld_passes_per_joint}
          step="any" 
          min="0" 
          placeholder="1.0"
        />
      </label>
      <label class="grid gap-2">
        <span class="text-sm font-medium text-black">Assembly hours</span>
        <input 
          class="input" 
          type="number" 
          bind:value={localPricing.labor.assembly_hours}
          step="any" 
          min="0" 
          placeholder="2.0"
        />
      </label>
      <label class="grid gap-2">
        <span class="text-sm font-medium text-black">Shop rate per hour ($)</span>
        <input 
          class="input" 
          type="number" 
          bind:value={localPricing.labor.shop_rate_per_hour}
          step="any" 
          min="0" 
          placeholder="85.0"
        />
      </label>
    </div>
  </section>

  <!-- Adders Section -->
  <section class="card">
    <div class="mb-6 pb-6 border-b border-black/10">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-semibold text-black">Adders</h2>
          <Tooltip text="Overhead and profit are applied as percentages of the subtotal. Choose whether paint is estimated per gallon or as a legacy percentage of the subtotal." />
        </div>
        <p class="text-sm text-zinc-600">Configure overhead, profit, and paint percentages</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <label class="grid gap-2">
        <span class="text-sm font-medium text-black">Overhead (%)</span>
        <input 
          class="input" 
          type="number" 
          bind:value={localPricing.adders.overhead_pct}
          step="any" 
          min="0" 
          max="1"
          placeholder="0.10"
        />
      </label>
      <label class="grid gap-2">
        <span class="text-sm font-medium text-black">Profit (%)</span>
        <input 
          class="input" 
          type="number" 
          bind:value={localPricing.adders.profit_pct}
          step="any" 
          min="0" 
          max="1"
          placeholder="0.12"
        />
      </label>
    </div>

    <div class="mt-8 space-y-4">
      <div class="flex items-center flex-wrap gap-4 text-sm font-medium text-black">
        <span class="uppercase tracking-wide text-xs text-zinc-500">Paint Pricing Mode</span>
        <label class="inline-flex items-center gap-2 text-zinc-700">
          <input
            type="radio"
            name="paint-mode"
            value="percentage"
            checked={paintMode === 'percentage'}
            on:change={() => setPaintMode('percentage')}
          />
          Percentage of subtotal
        </label>
        <label class="inline-flex items-center gap-2 text-zinc-700">
          <input
            type="radio"
            name="paint-mode"
            value="per-gallon"
            checked={paintMode === 'per-gallon'}
            on:change={() => setPaintMode('per-gallon')}
          />
          Price per gallon (recommended)
        </label>
      </div>

      {#if paintMode === 'per-gallon'}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label class="grid gap-2">
            <span class="text-sm font-medium text-black">Price per gallon ($)</span>
            <input
              class="input"
              type="number"
              min="0"
              step="any"
              bind:value={localPricing.adders.paint!.price_per_gallon}
            />
          </label>
          <label class="grid gap-2">
            <span class="text-sm font-medium text-black">Coverage (sq ft per gallon)</span>
            <input
              class="input"
              type="number"
              min="1"
              step="any"
              bind:value={localPricing.adders.paint!.coverage_sqft_per_gallon}
            />
          </label>
        </div>
        <p class="text-xs text-zinc-500">
          Gallons needed are calculated from the tank surface area using the coverage value above
          (350&nbsp;sq&nbsp;ft/gal is a common single-coat default—adjust for your coating spec).
        </p>
      {:else}
        <div class="grid gap-2 max-w-md">
          <span class="text-sm font-medium text-black">Paint percentage (%)</span>
          <input
            class="input"
            type="number"
            min="0"
            step="any"
            bind:value={localPricing.adders.paint_pct}
          />
          <p class="text-xs text-zinc-500">
            Portion of the subtotal to allocate for paint (legacy calculation).
          </p>
        </div>
      {/if}
    </div>
  </section>

  <!-- Defaults Section -->
  <section class="card">
    <div class="mb-6 pb-6 border-b border-black/10">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-semibold text-black">Defaults</h2>
          <Tooltip text="Choose which material key the tank form selects by default so users start with the most common spec." />
        </div>
        <p class="text-sm text-zinc-600">Set default material selection</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <label class="grid gap-2">
        <span class="text-sm font-medium text-black">Default Material Key</span>
        <select class="input" bind:value={localPricing.defaults.material_key}>
          {#each Object.keys(localPricing.materials || {}) as key}
            <option value={key}>{key}</option>
          {/each}
        </select>
      </label>
    </div>
  </section>

  <!-- Save Button -->
  <div class="flex justify-end gap-3">
    <button 
      class="btn btn-primary" 
      on:click={handleSave}
      disabled={saving}
    >
      {#if saving}
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      {/if}
      Save Pricing
    </button>
  </div>
</div>

