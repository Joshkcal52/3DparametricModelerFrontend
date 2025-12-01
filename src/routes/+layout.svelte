<script lang="ts">
  import '../app.css';
</script>

<div class="min-h-screen bg-white text-black">
  <header class="border-b border-black/10 bg-white sticky top-0 z-50 backdrop-blur-sm">
    <div class="mx-auto max-w-7x1 px-40 py-3 flex items-center justify-between">
      <a href="/" class="flex items-center">
        <img src="/logo.png" alt="Coyote Tanks Inc." class="h-24 w-auto" />
      </a>
      <h1 class="coyote-title text-3xl font-semibold tracking-tight absolute left-1/2 transform -translate-x-1/2">Coyote / CAD</h1>
      <nav class="flex items-center gap-2">
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

  <main class="mx-auto max-w-[1600px] px-4 py-10">
    <slot />
  </main>

  <footer class="mt-16 border-t border-black/10 bg-white">
    <div class="mx-auto max-w-7xl px-6 py-6 text-xs text-zinc-500 flex justify-between items-center">
      <span>© {new Date().getFullYear()} Coyote Tanks. All rights reserved.</span>
      <a class="hover:text-black transition-colors underline hover:no-underline" href="https://kit.svelte.dev" target="_blank">Built on SvelteKit</a>
    </div>
  </footer>
</div>



