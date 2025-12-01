<script lang="ts">
  import PricingForm from '$lib/components/PricingForm.svelte';
  import { fetchPricing, updatePricing } from '$lib/api';
  import { onMount } from 'svelte';

  let pricing: any = null;
  let loading = false;
  let saving = false;
  let error: string | null = null;
  let success = false;

  onMount(async () => {
    await loadPricing();
  });

  async function loadPricing() {
    loading = true;
    error = null;
    try {
      pricing = await fetchPricing();
      success = false;
    } catch (e) {
      console.error('Failed to load pricing:', e);
      error = e instanceof Error ? e.message : 'Failed to load pricing data';
    } finally {
      loading = false;
    }
  }

  async function handleSave(updatedPricing: any) {
    saving = true;
    error = null;
    success = false;
    try {
      await updatePricing(updatedPricing);
      pricing = updatedPricing;
      success = true;
      setTimeout(() => { success = false; }, 3000);
    } catch (e) {
      console.error('Failed to save pricing:', e);
      error = e instanceof Error ? e.message : 'Failed to save pricing data';
    } finally {
      saving = false;
    }
  }
</script>

<div class="space-y-8">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-semibold text-black mb-2">Pricing Management</h1>
      <p class="text-sm text-zinc-600">Configure material costs, labor rates, and pricing adders</p>
    </div>
    <button 
      class="btn btn-outline" 
      on:click={loadPricing}
      disabled={loading}
    >
      {#if loading}
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      {/if}
      Reload
    </button>
  </div>

  {#if error}
    <section class="card">
      <div class="flex items-center gap-3 text-red-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="font-semibold mb-1">Error</h3>
          <p class="text-sm">{error}</p>
        </div>
      </div>
    </section>
  {/if}

  {#if success}
    <section class="card">
      <div class="flex items-center gap-3 text-green-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="font-medium">Pricing saved successfully!</span>
      </div>
    </section>
  {/if}

  {#if loading}
    <section class="card">
      <div class="flex items-center gap-3 text-zinc-600">
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading pricing data...</span>
      </div>
    </section>
  {:else if pricing}
    <PricingForm {pricing} onSave={handleSave} {saving} />
  {/if}
</div>

