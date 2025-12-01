<script lang="ts">
  import { browser } from '$app/environment';
  
  export let stepUrl: string;
  // stepUrl should be a publicly accessible STEP file path: /generated/mytank.step
  
  // Use absolute URL - the viewer needs a full URL to fetch from
  // Don't double-encode: encodeURIComponent handles the full URL
  $: fullUrl = browser ? `${window.location.origin}${stepUrl}` : stepUrl;
  // Construct viewer URL with model parameter
  // The model parameter should be the full absolute URL
  $: viewerUrl = browser 
    ? `/viewer/embed.html#model=${fullUrl}`
    : '';
</script>

<div class="w-full h-[600px] border border-black/10 rounded-xl overflow-hidden bg-white">
  {#if browser && viewerUrl}
    <iframe
      src={viewerUrl}
      class="w-full h-full"
      frameborder="0"
      allowfullscreen
      title="3D Model Viewer">
    </iframe>
  {:else}
    <div class="w-full h-full flex items-center justify-center text-zinc-500">
      <p>Loading viewer...</p>
    </div>
  {/if}
</div>

