// Animate transforms only; the result is committed after motion has settled.
export function playFortuneDraw(element, { reducedMotion = false, onReveal } = {}) {
  let cancelled = false, animation;
  if (!reducedMotion && typeof element.animate === 'function') {
    animation = element.animate([
      { transform: 'translate3d(0,0,0) rotate(0deg)' },
      { transform: 'translate3d(-2px,-2px,0) rotate(-7deg)', offset: .15 },
      { transform: 'translate3d(3px,-4px,0) rotate(8deg)', offset: .3 },
      { transform: 'translate3d(-2px,-3px,0) rotate(-6deg)', offset: .45 },
      { transform: 'translate3d(2px,-2px,0) rotate(4deg)', offset: .6 },
      { transform: 'translate3d(-1px,-1px,0) rotate(-2deg)', offset: .78 },
      { transform: 'translate3d(0,0,0) rotate(0deg)' },
    ], { duration: 1100, easing: 'ease-in-out' });
  }
  const finished = Promise.resolve(animation?.finished).then(() => {
    if (cancelled) return false;
    onReveal(); return true;
  }, () => false);
  return { finished, cancel() { cancelled = true; animation?.cancel(); } };
}
