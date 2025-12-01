<script lang="ts">
  import TankForm from '$lib/components/TankForm.svelte';
  import QuoteResults from '$lib/components/QuoteResults.svelte';
  import StepDownload from '$lib/components/StepDownload.svelte';
  import { fetchMaterials, requestQuote, generateStep } from '$lib/api';
  import type { QuoteResult, TankParams } from '$lib/types';
  import { initPresets, presets, addPreset, removePreset } from '$lib/stores/presets';
  import { onMount } from 'svelte';

  let materials: Record<string, { name: string }> = {};
  let quote: QuoteResult | null = null;
  let stepHref = '';
  let stepFilename: string | undefined;
  let quoteLoading = false;
  let quoteError: string | null = null;
  let stepLoading = false;
  let stepError: string | null = null;

  onMount(async () => {
    initPresets();
    try {
      const res = await fetchMaterials();
      materials = res.materials as any;
    } catch (e) {
      console.error('Materials load failed', e);
    }
  });

  async function handleQuote(p: TankParams) {
    quote = null; // clear
    quoteError = null;
    quoteLoading = true;
    try {
      const res = await requestQuote(p);
      quote = res;
      console.log('Quote received:', res);
    } catch (e) {
      console.error('Quote failed:', e);
      quoteError = e instanceof Error ? e.message : 'Failed to get quote. Please check your inputs and try again.';
    } finally {
      quoteLoading = false;
    }
  }

  async function handleStep(p: TankParams) {
    stepHref = '';
    stepFilename = undefined;
    stepError = null;
    stepLoading = true;
    try {
      const res = await generateStep(p);
      stepHref = res.href;
      stepFilename = res.filename;
      console.log('STEP generated:', res);
    } catch (e) {
      console.error('STEP generation failed:', e);
      stepError = e instanceof Error ? e.message : 'Failed to generate STEP file. Please try again.';
    } finally {
      stepLoading = false;
    }
  }

  // Presets helpers
  let newPresetName = '';
  function savePresetFromQuote() {
    if (!quote) return;
    addPreset({ name: newPresetName || 'Preset', params: (quote as any).input ?? {} });
    newPresetName = '';
  }
</script>

<div class="grid lg:grid-cols-3 gap-8">
  <div class="lg:col-span-2 space-y-8">
    <TankForm {materials} onQuote={handleQuote} onStep={handleStep} {quoteLoading} {stepLoading} />

    {#if stepError}
      <section class="card">
        <div class="flex items-center gap-3 text-red-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-semibold mb-1">Error</h3>
            <p class="text-sm">{stepError}</p>
          </div>
        </div>
      </section>
    {/if}

    {#if stepLoading}
      <section class="card">
        <div class="flex items-center gap-3 text-zinc-600">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Generating STEP file...</span>
        </div>
      </section>
    {/if}

    {#if stepHref}
      <section class="card flex items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-semibold text-black mb-1">STEP file ready</h3>
          <p class="text-sm text-zinc-600">Use the button to download the model.</p>
        </div>
        <StepDownload href={stepHref} filename={stepFilename} />
      </section>
    {/if}

    {#if quoteError}
      <section class="card">
        <div class="flex items-center gap-3 text-red-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-semibold mb-1">Error</h3>
            <p class="text-sm">{quoteError}</p>
          </div>
        </div>
      </section>
    {/if}

    {#if quoteLoading}
      <section class="card">
        <div class="flex items-center gap-3 text-zinc-600">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading quote...</span>
        </div>
      </section>
    {/if}

    <QuoteResults {quote} />
  </div>

  <aside class="space-y-6">
    <section class="card">
      <h3 class="text-lg font-semibold text-black mb-4">Presets</h3>
      <div class="flex gap-2 mb-4">
        <input 
          class="input flex-1" 
          placeholder="Preset name…" 
          bind:value={newPresetName} 
        />
        <button 
          class="btn btn-primary" 
          on:click={savePresetFromQuote} 
          disabled={!newPresetName}
        >
          Save
        </button>
      </div>

      {#if $presets.length > 0}
        <ul class="divide-y divide-black/10">
          {#each $presets as p}
            <li class="py-3 flex items-center justify-between group">
              <span class="font-medium text-sm text-black">{p.name}</span>
              <button 
                class="text-xs text-zinc-500 hover:text-black underline opacity-0 group-hover:opacity-100 transition-opacity" 
                on:click={() => removePreset(p.name)}
              >
                Delete
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="text-sm text-zinc-500 italic">No presets saved yet.</p>
      {/if}

      <p class="mt-4 text-xs text-zinc-500 pt-4 border-t border-black/10">
        Presets are stored locally in your browser.
      </p>
    </section>

    <section class="card">
      <h3 class="text-lg font-semibold text-black mb-4">Notes</h3>
      <ul class="space-y-2 text-sm text-zinc-600">
        <li class="flex items-start gap-2">
          <span class="text-black mt-1">•</span>
          <span>Materials list is fetched from the backend <code class="px-1.5 py-0.5 bg-zinc-100 rounded text-xs font-mono">/pricing</code> or the JSON file fallback.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-black mt-1">•</span>
          <span><code class="px-1.5 py-0.5 bg-zinc-100 rounded text-xs font-mono">Generate STEP</code> tries JSON <code class="px-1.5 py-0.5 bg-zinc-100 rounded text-xs font-mono">download_url</code> first, otherwise streams the file.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-black mt-1">•</span>
          <span>All inputs are in inches; currency is USD.</span>
        </li>
      </ul>
    </section>
  </aside>
</div>



