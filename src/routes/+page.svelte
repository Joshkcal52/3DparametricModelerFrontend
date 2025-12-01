<script lang="ts">
  import TankForm from '$lib/components/TankForm.svelte';
  import QuoteResults from '$lib/components/QuoteResults.svelte';
  import StepDownload from '$lib/components/StepDownload.svelte';
  import StepViewer from '$lib/components/StepViewer.svelte';
  import { fetchMaterials, requestQuote, generateStep } from '$lib/api';
  import type { QuoteResult, TankParams } from '$lib/types';
  import { initPresets, presets, addPreset, removePreset } from '$lib/stores/presets';
  import { onMount } from 'svelte';

  let materials: Record<string, { name: string }> = {};
  let quote: QuoteResult | null = null;
  let stepHref = '';
  let stepViewUrl = '';
  let stepFilename: string | undefined;
  let quoteLoading = false;
  let quoteError: string | null = null;
  let stepLoading = false;
  let stepError: string | null = null;
  let showViewer = false; // Toggle between quote and viewer

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
    showViewer = false; // Show quote when it loads
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
    stepViewUrl = '';
    stepFilename = undefined;
    stepError = null;
    stepLoading = true;
    try {
      const res = await generateStep(p);
      stepHref = res.href;
      stepViewUrl = res.viewUrl || res.href;
      stepFilename = res.filename;
      showViewer = true; // Show viewer when STEP is generated
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

<div class="grid lg:grid-cols-10 gap-8">
  <!-- Left Column: Presets and Notes (stacked) -->
  <div class="lg:col-span-2 space-y-6">
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
  </div>

  <!-- Middle Column: Tank Form -->
  <div class="lg:col-span-4 space-y-8">
    <TankForm {materials} onQuote={handleQuote} onStep={handleStep} {quoteLoading} {stepLoading} />
  </div>

  <!-- Right Column: Toggleable Quote/Viewer -->
  <div class="lg:col-span-4 space-y-8">
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

    <!-- Toggleable Content Area -->
    <section class="card">
      <!-- Toggle Buttons -->
      <div class="mb-4 flex items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div class="flex gap-2">
          <button
            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors {!showViewer ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}"
            on:click={() => showViewer = false}
          >
            Quote
          </button>
          <button
            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors {showViewer ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}"
            on:click={() => showViewer = true}
          >
            3D Model
          </button>
        </div>
        {#if stepHref && showViewer}
          <StepDownload href={stepHref} filename={stepFilename} />
        {/if}
      </div>

      <!-- Content Area -->
      <div class="min-h-[600px]">
        {#if showViewer && stepHref}
          <StepViewer stepUrl={stepViewUrl} />
        {:else if showViewer && !stepHref}
          <div class="w-full h-[600px] border border-black/10 rounded-xl overflow-hidden bg-zinc-50 flex items-center justify-center">
            <div class="text-center space-y-4">
              <svg class="w-16 h-16 mx-auto text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <div>
                <p class="text-sm font-medium text-black mb-2">No model loaded</p>
                <p class="text-xs text-zinc-600">Click "Generate STEP" to create and preview your tank model</p>
              </div>
            </div>
          </div>
        {:else if quote}
          <QuoteResults {quote} />
        {:else}
          <div class="w-full h-[600px] border border-black/10 rounded-xl overflow-hidden bg-zinc-50 flex items-center justify-center">
            <div class="text-center space-y-4">
              <svg class="w-16 h-16 mx-auto text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p class="text-sm font-medium text-black mb-2">No quote yet</p>
                <p class="text-xs text-zinc-600">Click "Get Quote" to see pricing information here</p>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </section>
  </div>
</div>



