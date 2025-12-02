<script lang="ts">
  export let text = '';
</script>

<button class="tooltip" type="button" aria-label={text}>
  <slot>
    <span class="tooltip-icon" aria-hidden="true">i</span>
  </slot>
  <span class="tooltip-content">
    {text}
  </span>
</button>

<style>
  .tooltip {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 999px;
    background: #f4f4f5;
    color: #18181b;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: help;
    transition: background-color 150ms ease, color 150ms ease;
    outline: none;
  }

  .tooltip:focus,
  .tooltip:hover {
    background: #18181b;
    color: white;
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
  }

  .tooltip-icon {
    line-height: 1;
  }

  .tooltip-content {
    position: absolute;
    bottom: calc(100% + 0.5rem);
    left: 50%;
    transform: translateX(-50%);
    min-width: 12rem;
    max-width: 16rem;
    padding: 0.75rem;
    border-radius: 0.75rem;
    background: #0c0c0d;
    color: white;
    font-size: 0.75rem;
    line-height: 1.2;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    opacity: 0;
    pointer-events: none;
    transition: opacity 150ms ease;
    z-index: 20;
  }

  .tooltip:focus .tooltip-content,
  .tooltip:hover .tooltip-content {
    opacity: 1;
  }

  @media (max-width: 640px) {
    .tooltip-content {
      left: 0;
      transform: none;
    }
  }
</style>

