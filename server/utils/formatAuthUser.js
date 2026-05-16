import { getTrustLabel, getTrustPills } from './calcTrustScore.js';

/** Safe JSON user for login/register (includes email; adds trust UI fields). */
export function formatAuthUser(user) {
  const o = user.toObject();
  delete o.password;
  delete o.refreshToken;
  const score = o.trustScore ?? 50;
  return {
    ...o,
    trustLabel: getTrustLabel(score),
    trustPills: getTrustPills(o),
  };
}
