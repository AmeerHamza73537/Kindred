const BADGE_DEFS = [
  { id: 'first_share', name: 'First Share', icon: '🌱', check: (u) => u.itemsShared >= 1 },
  { id: 'ten_handoffs', name: '10 Handoffs', icon: '🤝', check: (u) => u.successfulHandoffs >= 10 },
  { id: 'super_neighbor', name: 'Super Neighbor', icon: '⭐', check: (u) => u.trustScore >= 85 && u.successfulHandoffs >= 3 },
  { id: 'helpful', name: 'Community Helper', check: (u) => u.helpfulnessVotes >= 5, icon: '💚' },
  {
    id: 'highly_rated',
    name: 'Highly Rated',
    icon: '🌟',
    check: (u) => (u.ratingCount || 0) >= 3 && (u.ratingAverage || 0) >= 4.5,
  },
];

/**
 * Trust ring fills 10% per successful lend/gift, completing at 10 exchanges.
 * Both parties of an exchange earn credit via `successfulHandoffs`.
 */
export function calcTrustScore(user) {
  const handoffs = user.successfulHandoffs || 0;
  return Math.min(100, Math.max(0, handoffs * 10));
}

export function getTrustLabel(score) {
  if (score >= 75) return 'Trusted Neighbor';
  if (score >= 45) return 'Rising Helper';
  return 'New Member';
}

/** Small pill metrics for UI (0–3 scale each) */
export function getTrustPills(user) {
  const r = Math.min(3, Math.floor((user.successfulHandoffs || 0) / 3));
  const g = Math.min(3, Math.floor((user.itemsShared || 0) / 2));
  const resp = Math.min(3, Math.floor((user.helpfulnessVotes || 0) / 2));
  return {
    reliability: ['Low', 'Good', 'Strong', 'Rock-solid'][r],
    generosity: ['Low', 'Good', 'Strong', 'Rock-solid'][g],
    responsiveness: ['Low', 'Good', 'Strong', 'Rock-solid'][resp],
  };
}

export function syncBadges(user) {
  const existing = new Set((user.badges || []).map((b) => b.name));
  const now = new Date();
  for (const def of BADGE_DEFS) {
    if (def.check(user) && !existing.has(def.name)) {
      user.badges.push({ name: def.name, icon: def.icon, earnedAt: now });
      existing.add(def.name);
    }
  }
}

export function applyTrustScore(user) {
  user.trustScore = calcTrustScore(user);
  syncBadges(user);
}
