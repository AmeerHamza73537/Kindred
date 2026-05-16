export function trustLabelFromScore(score) {
  if (score >= 75) return 'Trusted Neighbor';
  if (score >= 45) return 'Rising Helper';
  return 'New Member';
}

export function trustColor(score) {
  if (score >= 75) return '#2D6A4F';
  if (score >= 45) return '#F4A261';
  return '#94a3b8';
}
