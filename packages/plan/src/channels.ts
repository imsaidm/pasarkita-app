/**
 * Channel menentukan aplikasi mana yang didapat sebuah tenant.
 * Ini sumbu tegak dari matriks paket.
 */

export const CHANNELS = ['offline', 'online', 'omni'] as const;
export type Channel = (typeof CHANNELS)[number];

export const APPS = ['pos', 'store', 'dashboard'] as const;
export type AppName = (typeof APPS)[number];

const APPS_BY_CHANNEL: Readonly<Record<Channel, readonly AppName[]>> = Object.freeze({
  offline: Object.freeze(['pos', 'dashboard'] as const),
  online: Object.freeze(['store', 'dashboard'] as const),
  omni: Object.freeze(['pos', 'store', 'dashboard'] as const),
});

export const CHANNEL_LABELS: Readonly<Record<Channel, string>> = Object.freeze({
  offline: 'Toko Offline',
  online: 'Toko Online',
  omni: 'Omnichannel',
});

export function isChannel(value: unknown): value is Channel {
  return typeof value === 'string' && (CHANNELS as readonly string[]).includes(value);
}

/** Daftar aplikasi yang boleh diakses sebuah channel. */
export function appsFor(channel: Channel): readonly AppName[] {
  return APPS_BY_CHANNEL[channel];
}

/** Apakah channel ini berhak membuka aplikasi tertentu. */
export function hasApp(channel: Channel, app: AppName): boolean {
  return APPS_BY_CHANNEL[channel].includes(app);
}
