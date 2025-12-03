<script lang="ts">
  import type { QuoteResult } from '$lib/types';
  import LineItemsTable from './LineItemsTable.svelte';
  export let quote: QuoteResult | null = null;

  const formatNumber = (value: number | null | undefined, options?: Intl.NumberFormatOptions): string => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
    return value.toLocaleString(undefined, options);
  };
</script>

{#if quote}
  <section class="card">
    <div class="mb-6 pb-6 border-b border-black/10">
      <h3 class="text-2xl font-semibold text-black mb-1">Quote Results</h3>
      <p class="text-sm text-zinc-600">Detailed breakdown of your tank quote</p>
    </div>

    <div class="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
      <div class="space-y-3">
        <h4 class="text-sm font-semibold text-black uppercase tracking-wide mb-3">Specifications</h4>
        <div class="grid gap-2.5 text-sm">
          <div class="flex justify-between">
            <span class="text-zinc-600">Material:</span>
            <span class="font-medium text-black">{quote.material_key || '-'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-600">Outer radius:</span>
            <span class="font-medium text-black">
              {formatNumber(quote.outer_radius, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-600">Inner radius:</span>
            <span class="font-medium text-black">
              {formatNumber(quote.inner_radius, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-600">Weld inches:</span>
            <span class="font-medium text-black">
              {formatNumber(quote.weld_inches, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} in
            </span>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <h4 class="text-sm font-semibold text-black uppercase tracking-wide mb-3">Geometry</h4>
        <div class="grid gap-2.5 text-sm">
          <div class="flex justify-between">
            <span class="text-zinc-600">Nominal volume:</span>
            <span class="font-medium text-black">
              {formatNumber(quote.gallons, { maximumFractionDigits: 0 })} gal
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-600">Shell surface area:</span>
            <span class="font-medium text-black">
              {formatNumber(quote.surface_area_shell, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} in²
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-600">Roof surface area:</span>
            <span class="font-medium text-black">
              {formatNumber(quote.surface_area_roof, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} in²
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-600">Bottom surface area:</span>
            <span class="font-medium text-black">
              {formatNumber(quote.surface_area_bottom, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} in²
            </span>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <h4 class="text-sm font-semibold text-black uppercase tracking-wide mb-3">Cost Breakdown</h4>
        <div class="grid gap-2.5 text-sm">
          <div class="flex justify-between">
            <span class="text-zinc-600">Material weight:</span>
            <span class="font-medium text-black">{(quote.material_lb ?? 0).toFixed(1)} lb</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-600">Material cost:</span>
            <span class="font-medium text-black">${(quote.material_cost ?? 0).toFixed(2)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-600">Labor cost:</span>
            <span class="font-medium text-black">${(quote.labor_cost ?? 0).toFixed(2)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-600">Adders:</span>
            <span class="font-medium text-black">${(quote.adders_cost ?? 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    {#if quote.line_items && quote.line_items.length > 0}
      <div class="mb-6 pt-6 border-t border-black/10">
        <h4 class="text-sm font-semibold text-black uppercase tracking-wide mb-4">Line Items</h4>
        <LineItemsTable items={quote.line_items} />
      </div>
    {/if}

    <div class="flex items-center justify-end gap-8 pt-6 border-t border-black/10">
      <div class="text-right">
        <div class="text-sm text-zinc-600 mb-1">Subtotal</div>
        <div class="text-lg font-semibold text-black">${(quote.subtotal ?? 0).toFixed(2)} {quote.currency || 'USD'}</div>
      </div>
      <div class="text-right">
        <div class="text-sm text-zinc-600 mb-1">Total</div>
        <div class="text-3xl font-bold text-black tracking-tight">${(quote.total ?? 0).toFixed(2)} {quote.currency || 'USD'}</div>
      </div>
    </div>
  </section>
{/if}



