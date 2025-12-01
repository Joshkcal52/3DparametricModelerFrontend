import { writable } from 'svelte/store';
import type { TankParams } from '$lib/types';

export interface Preset { name: string; params: TankParams }

const LS_KEY = 'coyotecad.presets.v1';

function load(): Preset[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function save(list: Preset[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export const presets = writable<Preset[]>([]);

export function initPresets() {
  if (typeof window === 'undefined') return;
  presets.set(load());
}

export function addPreset(p: Preset) {
  presets.update((list) => {
    const next = [...list.filter((x) => x.name !== p.name), p];
    save(next);
    return next;
  });
}

export function removePreset(name: string) {
  presets.update((list) => {
    const next = list.filter((x) => x.name !== name);
    save(next);
    return next;
  });
}



