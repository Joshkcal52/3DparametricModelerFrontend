<script lang="ts">
  import type { PricingConfig } from '$lib/types';

  export let pricing: PricingConfig;
  export let onSave: (p: PricingConfig) => Promise<void>;
  export let saving = false;

  let localPricing: PricingConfig = structuredClone(pricing);

  // Watch for pricing changes from parent
  $: localPricing = structuredClone(pricing);

  function handleSave() {
    onSave(localPricing);
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
</script>

<div class="space-y-8">
  <!-- Materials Section -->
  <section class="card">
    <div class="mb-6 pb-6 border-b border-black/10">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-black mb-1">Materials</h2>
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
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-black">{key}</h3>
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
      <h2 class="text-2xl font-semibold text-black mb-1">Labor</h2>
      <p class="text-sm text-zinc-600">Configure welding and assembly labor rates</p>
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
      <h2 class="text-2xl font-semibold text-black mb-1">Adders</h2>
      <p class="text-sm text-zinc-600">Configure overhead, profit, and paint percentages</p>
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
      <label class="grid gap-2">
        <span class="text-sm font-medium text-black">Paint (%)</span>
        <input 
          class="input" 
          type="number" 
          bind:value={localPricing.adders.paint_pct}
          step="any" 
          min="0" 
          max="1"
          placeholder="0.00"
        />
      </label>
    </div>
  </section>

  <!-- Defaults Section -->
  <section class="card">
    <div class="mb-6 pb-6 border-b border-black/10">
      <h2 class="text-2xl font-semibold text-black mb-1">Defaults</h2>
      <p class="text-sm text-zinc-600">Set default material selection</p>
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

