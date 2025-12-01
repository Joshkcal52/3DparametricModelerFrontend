<script lang="ts">
  export let href = '';
  export let filename: string | undefined;
</script>

{#if href}
  <a class="btn btn-primary" href={href} download={filename}>Download STEP{filename ? ` (${filename})` : ''}</a>
{/if}



