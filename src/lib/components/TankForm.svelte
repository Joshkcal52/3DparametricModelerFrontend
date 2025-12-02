<script lang="ts">
  import { z } from 'zod';
  import type { TankParams, RoofType, MaterialMap } from '$lib/types';

  export let materials: MaterialMap; // key → { name }
  export let onQuote: (p: TankParams) => Promise<void>;
  export let onStep: (p: TankParams) => Promise<void>;
  export let quoteLoading = false;
  export let stepLoading = false;

  const defaults: TankParams = {
    diameter: 120,
    height: 144,
    wall_thickness: 0.25,
    bottom_thickness: 0.25,
    roof_type: 'flat',
    roof_thickness: 0.25,
    roof_slope: 0.5,
    manway: null,
    material_key: null
  };

  let form: TankParams = structuredClone(defaults);
  let includeManway = false;
  let formError: string | null = null;

  function setFormValue(next: TankParams) {
    const clone = structuredClone(next);
    form = clone;
    includeManway = Boolean(clone.manway);
  }

  const mergeWithDefaults = (params: TankParams): TankParams => {
    const base = structuredClone(defaults);
    const incoming = structuredClone(params);
    return {
      ...base,
      ...incoming,
      manway: incoming.manway ?? null
    };
  };

  export function applyPreset(params: TankParams) {
    setFormValue(mergeWithDefaults(params));
  }

  function toggleManway() {
    if (includeManway) {
      form.manway = { width: 24, height: 24, offset_up: 18, corner_radius: 2 };
    } else {
      form.manway = null;
    }
  }

  const schema = z.object({
    diameter: z.number().positive(),
    height: z.number().positive(),
    wall_thickness: z.number().positive(),
    bottom_thickness: z.number().positive(),
    roof_type: z.enum(['flat', 'cone']),
    roof_thickness: z.number().positive(),
    roof_slope: z.number().nonnegative(),
    manway: z
      .object({
        width: z.number().positive(),
        height: z.number().positive(),
        offset_up: z.number().default(18),
        corner_radius: z.number().positive().default(2)
      })
      .nullable()
      .optional(),
    material_key: z.string().nullable().optional()
  });

  function toNumber(e: Event) {
    const t = e.target as HTMLInputElement;
    const v = parseFloat(t.value);
    return isNaN(v) ? undefined : v;
  }

  function submitQuote() {
    // validate & emit
    try {
      const clean = schema.parse(form);
      formError = null;
      onQuote(clean);
    } catch (e) {
      formError = 'Please check your inputs.';
    }
  }

  function submitStep() {
    try {
      const clean = schema.parse(form);
      formError = null;
      onStep(clean);
    } catch (e) {
      formError = 'Please check your inputs.';
    }
  }
</script>

<section class="card">
  <div class="mb-8 pb-6 border-b border-black/10">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h2 class="text-2xl font-semibold text-black mb-1">Tank Parameters</h2>
        <p class="text-sm text-zinc-600">Configure your tank specifications</p>
      </div>
      <div class="flex gap-3 flex-wrap">
        <button class="btn btn-outline" on:click={() => setFormValue(defaults)}>
          Reset
        </button>
        <button
          type="button"
          on:click={submitQuote}
          disabled={quoteLoading}
          class="relative bottom-0 flex justify-center items-center gap-2 border border-black rounded-xl text-white font-medium bg-black px-5 py-2.5 text-sm z-10 overflow-hidden ease-in-out duration-700 group hover:text-black hover:bg-white active:scale-95 active:duration-0 focus:bg-white focus:text-black isolation-auto before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-white before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 disabled:opacity-50 disabled:cursor-not-allowed {quoteLoading ? 'text-black bg-white' : ''}"
        >
          <span
            class="truncate ease-in-out duration-300 {quoteLoading ? '-translate-x-96' : 'group-active:-translate-x-96 group-focus:translate-x-96'}"
          >
            Get Quote
          </span>
          <div
            class="absolute flex flex-row justify-center items-center gap-2 -translate-x-96 ease-in-out duration-300 {quoteLoading ? 'translate-x-0' : 'group-active:translate-x-0 group-focus:translate-x-0'}"
          >
            <div
              class="animate-spin size-4 border-2 border-black border-t-transparent rounded-full"
            ></div>
            Processing...
          </div>
          <svg
            class="fill-white group-hover:fill-black group-hover:-translate-x-0 {quoteLoading ? 'translate-x-96 fill-black' : 'group-active:translate-x-96 group-active:duration-0 group-focus:translate-x-96 group-focus:fill-black'} ease-in-out duration-700"
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 512 512"
            height="16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m476.59 227.05-.16-.07L49.35 49.84A23.56 23.56 0 0 0 27.14 52 24.65 24.65 0 0 0 16 72.59v113.29a24 24 0 0 0 19.52 23.57l232.93 43.07a4 4 0 0 1 0 7.86L35.53 303.45A24 24 0 0 0 16 327v113.31A23.57 23.57 0 0 0 26.59 460a23.94 23.94 0 0 0 13.22 4 24.55 24.55 0 0 0 9.52-1.93L476.4 285.94l.19-.09a32 32 0 0 0 0-58.8z"
            ></path>
          </svg>
        </button>
        <button
          type="button"
          on:click={submitStep}
          disabled={stepLoading}
          class="relative bottom-0 flex justify-center items-center gap-2 border border-black rounded-xl text-black font-medium bg-white px-5 py-2.5 text-sm z-10 overflow-hidden ease-in-out duration-700 group hover:text-white hover:bg-black active:scale-95 active:duration-0 focus:bg-black focus:text-white isolation-auto before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-black before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 disabled:opacity-50 disabled:cursor-not-allowed {stepLoading ? 'text-white bg-black' : ''}"
        >
          <span
            class="truncate ease-in-out duration-300 {stepLoading ? '-translate-x-96' : 'group-active:-translate-x-96 group-focus:translate-x-96'}"
          >
            Generate STEP
          </span>
          <div
            class="absolute flex flex-row justify-center items-center gap-2 -translate-x-96 ease-in-out duration-300 {stepLoading ? 'translate-x-0' : 'group-active:translate-x-0 group-focus:translate-x-0'}"
          >
            <div
              class="animate-spin size-4 border-2 border-white border-t-transparent rounded-full"
            ></div>
            Processing...
          </div>
          <svg
            class="fill-black group-hover:fill-white group-hover:-translate-x-0 {stepLoading ? 'translate-x-96 fill-white' : 'group-active:translate-x-96 group-active:duration-0 group-focus:translate-x-96 group-focus:fill-white'} ease-in-out duration-700"
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 512 512"
            height="16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m476.59 227.05-.16-.07L49.35 49.84A23.56 23.56 0 0 0 27.14 52 24.65 24.65 0 0 0 16 72.59v113.29a24 24 0 0 0 19.52 23.57l232.93 43.07a4 4 0 0 1 0 7.86L35.53 303.45A24 24 0 0 0 16 327v113.31A23.57 23.57 0 0 0 26.59 460a23.94 23.94 0 0 0 13.22 4 24.55 24.55 0 0 0 9.52-1.93L476.4 285.94l.19-.09a32 32 0 0 0 0-58.8z"
            ></path>
          </svg>
        </button>
      </div>
      {#if formError}
        <p class="text-sm text-red-600 mt-2" role="alert">{formError}</p>
      {/if}
    </div>
  </div>

  <div class="space-y-8">
    <!-- Basic Dimensions -->
    <div>
      <h3 class="text-sm font-semibold text-black mb-4 uppercase tracking-wide">Basic Dimensions</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <label class="grid gap-2">
          <span class="text-sm font-medium text-black">Diameter (in)</span>
          <input class="input" type="number" bind:value={form.diameter} step="any" min="0" placeholder="120" />
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-medium text-black">Height (in)</span>
          <input class="input" type="number" bind:value={form.height} step="any" min="0" placeholder="144" />
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-medium text-black">Wall thickness (in)</span>
          <input class="input" type="number" bind:value={form.wall_thickness} step="any" min="0" placeholder="0.25" />
        </label>
      </div>
    </div>

    <!-- Bottom & Roof -->
    <div>
      <h3 class="text-sm font-semibold text-black mb-4 uppercase tracking-wide">Bottom & Roof</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <label class="grid gap-2">
          <span class="text-sm font-medium text-black">Bottom thickness (in)</span>
          <input class="input" type="number" bind:value={form.bottom_thickness} step="any" min="0" placeholder="0.25" />
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-medium text-black">Roof type</span>
          <select class="input" bind:value={form.roof_type}>
            <option value="flat">Flat</option>
            <option value="cone">Cone</option>
          </select>
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-medium text-black">Roof thickness (in)</span>
          <input class="input" type="number" bind:value={form.roof_thickness} step="any" min="0" placeholder="0.25" />
        </label>

        {#if form.roof_type === 'cone'}
          <label class="grid gap-2">
            <span class="text-sm font-medium text-black">Roof slope</span>
            <input class="input" type="number" bind:value={form.roof_slope} step="any" min="0" placeholder="0.5" />
          </label>
        {/if}
      </div>
    </div>

    <!-- Material Selection -->
    <div>
      <h3 class="text-sm font-semibold text-black mb-4 uppercase tracking-wide">Material</h3>
      <label class="grid gap-2">
        <span class="text-sm font-medium text-black">Material</span>
        <select class="input" bind:value={form.material_key}>
          <option value={null}>— Select material —</option>
          {#each Object.entries(materials) as [key, m]}
            <option value={key}>{m.name ?? key}</option>
          {/each}
        </select>
      </label>
    </div>

    <!-- Manway Options -->
    <div class="pt-4 border-t border-black/10">
      <div class="mb-4">
        <label class="inline-flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            bind:checked={includeManway}
            on:change={toggleManway}
            class="w-5 h-5"
          />
          <span class="text-sm font-semibold text-black group-hover:text-zinc-700">Add manway</span>
        </label>
      </div>

      {#if includeManway && form.manway}
        <div>
          <h4 class="text-sm font-semibold text-black uppercase tracking-wide mb-4">Manway Specifications</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
            <label class="grid gap-2">
              <span class="text-sm font-medium text-black">Width (in)</span>
              <input class="input" type="number" bind:value={form.manway.width} step="any" min="0" placeholder="24" />
            </label>
            <label class="grid gap-2">
              <span class="text-sm font-medium text-black">Height (in)</span>
              <input class="input" type="number" bind:value={form.manway.height} step="any" min="0" placeholder="24" />
            </label>
            <label class="grid gap-2">
              <span class="text-sm font-medium text-black">Offset up (in)</span>
              <input class="input" type="number" bind:value={form.manway.offset_up} step="any" placeholder="18" />
            </label>
            <label class="grid gap-2">
              <span class="text-sm font-medium text-black">Corner radius (in)</span>
              <input class="input" type="number" bind:value={form.manway.corner_radius} step="any" min="0" placeholder="2" />
            </label>
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>



