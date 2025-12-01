<script lang="ts">
  import '../app.css';
  export let data;
</script>

<div class="min-h-screen bg-white text-black">
  <header class="border-b border-black/10 bg-white sticky top-0 z-10 backdrop-blur-sm">
    <div class="mx-auto max-w-7xl px-6 py-5 flex items-center gap-3">
      <div class="flex items-center gap-3">
        <a href="/" class="flex items-center gap-3">
          <img src="/logo.png" alt="Coyote Tanks Inc." class="h-16 w-auto" />
          <h1 class="text-xl font-semibold tracking-tight text-black">CoyoteCAD</h1>
        </a>
      </div>
      <nav class="ml-auto flex items-center gap-2">
        <a 
          href="/" 
          class="px-4 py-2 text-base font-medium text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-lg transition-colors"
        >
          Tank Design
        </a>
        <span class="text-zinc-600 text-lg leading-none">|</span>
        <a 
          href="/pricing" 
          class="px-4 py-2 text-base font-medium text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-lg transition-colors"
        >
          Pricing
        </a>
      </nav>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-6 py-10">
    <slot />
  </main>

  <footer class="mt-16 border-t border-black/10 bg-white">
    <div class="mx-auto max-w-7xl px-6 py-6 text-xs text-zinc-500 flex justify-between items-center">
      <span>© {new Date().getFullYear()} Coyote Tanks. All rights reserved.</span>
      <a class="hover:text-black transition-colors underline hover:no-underline" href="https://kit.svelte.dev" target="_blank">Built on SvelteKit</a>
    </div>
  </footer>
</div>



