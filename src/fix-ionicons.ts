import { setAssetPath } from '@stencil/core/internal/client';

export function fixIoniconsBasePath(): void {
  try {
    const isCapacitor = !!(window as any).Capacitor;

    // ✅ Force Ionicons to load from our local assets
    const base = isCapacitor
      ? (window as any).Capacitor.convertFileSrc('/assets/ionicons/')
      : `${window.location.origin}/assets/ionicons/`;

    setAssetPath(base);
    console.log('[Ionicons Fix] Asset path set to:', base);
  } catch (err) {
    console.warn('[Ionicons Fix] Failed to set asset path:', err);
  }
}
