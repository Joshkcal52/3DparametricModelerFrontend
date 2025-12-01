<script lang="ts">
  import type { LineItem } from '$lib/types';
  export let items: LineItem[] = [];
</script>

<div class="overflow-x-auto -mx-2 px-2">
  <table class="min-w-full text-sm">
    <thead>
      <tr class="border-b border-black/10">
        <th class="py-3 pr-4 text-left text-xs font-semibold text-black uppercase tracking-wide">Item</th>
        <th class="py-3 pr-4 text-left text-xs font-semibold text-black uppercase tracking-wide">Qty</th>
        <th class="py-3 pr-4 text-left text-xs font-semibold text-black uppercase tracking-wide">Unit</th>
        <th class="py-3 pr-4 text-left text-xs font-semibold text-black uppercase tracking-wide">Rate</th>
        <th class="py-3 pl-4 text-right text-xs font-semibold text-black uppercase tracking-wide">Amount</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-black/5">
      {#each items as it}
        <tr class="hover:bg-zinc-50/50 transition-colors">
          <td class="py-3 pr-4 text-black">{it.label || '-'}</td>
          <td class="py-3 pr-4 text-zinc-700">{it.qty ?? '-'}</td>
          <td class="py-3 pr-4 text-zinc-600">{it.unit || '-'}</td>
          <td class="py-3 pr-4 text-zinc-700">${(it.rate ?? 0).toFixed(2)}</td>
          <td class="py-3 pl-4 text-right font-medium text-black">${(it.amount ?? 0).toFixed(2)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>



