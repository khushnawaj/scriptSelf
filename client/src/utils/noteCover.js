/** Premium shelf gradients (CSS linear-gradients). Keys match server `coverGradient`. */
export const COVER_GRADIENT_PRESETS = [
  { id: '', label: 'Default (Logic seal)' },
  { id: 'indigo', label: 'Indigo Bloom' },
  { id: 'rose', label: 'Rose Quartz' },
  { id: 'emerald', label: 'Emerald Depth' },
  { id: 'amber', label: 'Amber Glow' },
  { id: 'midnight', label: 'Midnight' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'forest', label: 'Forest' },
];

const GRADIENT_CSS = {
  indigo: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 45%, #c026d3 100%)',
  rose: 'linear-gradient(135deg, #be123c 0%, #db2777 50%, #9333ea 100%)',
  emerald: 'linear-gradient(135deg, #047857 0%, #059669 40%, #0d9488 100%)',
  amber: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #ea580c 100%)',
  midnight: 'linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #312e81 100%)',
  ocean: 'linear-gradient(135deg, #0369a1 0%, #0284c7 40%, #06b6d4 100%)',
  sunset: 'linear-gradient(135deg, #c2410c 0%, #ea580c 35%, #f59e0b 100%)',
  forest: 'linear-gradient(135deg, #14532d 0%, #166534 45%, #15803d 100%)',
};

export function getCoverGradientStyle(coverGradient) {
  if (!coverGradient || !GRADIENT_CSS[coverGradient]) return null;
  return { background: GRADIENT_CSS[coverGradient] };
}
