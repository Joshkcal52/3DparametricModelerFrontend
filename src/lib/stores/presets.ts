import { writable } from 'svelte/store';
import type { Preset, TankParams } from '$lib/types';
import { listPresets, savePreset as savePresetApi, deletePreset as deletePresetApi } from '$lib/api';

export const presets = writable<Preset[]>([]);

const sortByName = (list: Preset[]): Preset[] => [...list].sort((a, b) => a.name.localeCompare(b.name));

export async function loadPresets(): Promise<Preset[]> {
  const data = await listPresets();
  const sorted = sortByName(data);
  presets.set(sorted);
  return sorted;
}

export async function savePreset(name: string, params: TankParams): Promise<void> {
  await savePresetApi(name, params);
  presets.update((list) => sortByName([...list.filter((x) => x.name !== name), { name, params }]));
}

export async function deletePreset(name: string): Promise<void> {
  await deletePresetApi(name);
  presets.update((list) => list.filter((x) => x.name !== name));
}

