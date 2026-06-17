export function trustLabelFromScore(score) {
  if (score >= 75) return 'Trusted Neighbor';
  if (score >= 45) return 'Rising Helper';
  return 'New Member';
}

export function trustColor(score) {
  // Gold once the ring is complete (10 exchanges); green while it fills.
  return score >= 100 ? '#EAB308' : '#2D6A4F';
}
