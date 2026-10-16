export const GIFT_COUNT = 7;

export function getJourneyProgress(gifts) {
  const collected = Array.from({ length: GIFT_COUNT }, (_, station) => gifts.has(station));
  const missing = collected.indexOf(false);
  return {
    collected,
    count: collected.filter(Boolean).length,
    firstMissing: missing < 0 ? GIFT_COUNT : missing,
    complete: missing < 0,
  };
}

export function canVisitStation(station, gifts) {
  return Number.isInteger(station) && station >= 0 && station <= getJourneyProgress(gifts).firstMissing;
}

export function getPrimaryAction(station, gifts) {
  const progress = getJourneyProgress(gifts);
  if (!canVisitStation(station, gifts)) return { type: 'move', station: progress.firstMissing };
  if (station === GIFT_COUNT) return { type: 'wish' };
  return gifts.has(station) ? { type: 'move', station: station + 1 } : { type: 'collect', station };
}
