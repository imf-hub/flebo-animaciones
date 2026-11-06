// Helpers for future time-addressable scenes. Not a clinical model or a final visual.
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const wrap01 = x => ((x % 1) + 1) % 1;
export const easeInOut = x => { const p = clamp01(x); return p * p * (3 - 2 * p); };

export function transitionAt(t, { start, end, from, to }) {
  if (!(end > start)) throw new RangeError('El final debe ser posterior al inicio.');
  const progress = easeInOut((t - start) / (end - start));
  return from + (to - from) * progress;
}

export function seededParticles(count, seed = 1) {
  if (!Number.isInteger(count) || count < 0) throw new RangeError('Cantidad inválida.');
  let value = seed | 0;
  const random = () => { value |= 0; value = value + 0x6D2B79F5 | 0; let x = Math.imul(value ^ value >>> 15, 1 | value); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  return Array.from({ length: count }, () => ({ phase: random(), radial: Math.sqrt(random()) * 0.8, angle: random() * 2 * Math.PI }));
}

// velocity is a signed, constant number of path-lengths per second.
// For changing velocity, supply the analytic integral or use fixed-step state reconstruction.
export function sampleParticle(particle, t, velocity = 0.2) {
  return { ...particle, path: wrap01(particle.phase + velocity * t), spin: particle.angle + t * 0.6 };
}

export function sampleScene(t, particles, parameters = {}) {
  const velocity = parameters.velocity ?? 0.2;
  const opening = transitionAt(t, { start: 1, end: 2, from: 0, to: 1 });
  return { time: t, opening, particles: particles.map(p => sampleParticle(p, t, velocity)) };
}
