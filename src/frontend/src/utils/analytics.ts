import type { Observation, Kaizen } from '../backend';
import { format, subDays } from 'date-fns';

export function calculateSubmissionsOverTime(observations: Observation[], kaizens: Kaizen[]) {
  const allSubmissions = [
    ...observations.map((o) => ({ timestamp: o.timestamp })),
    ...kaizens.map((k) => ({ timestamp: k.timestamp })),
  ];

  const dailyCounts: Record<string, number> = {};
  
  // Initialize last 90 days
  for (let i = 89; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    dailyCounts[date] = 0;
  }

  allSubmissions.forEach((sub) => {
    const date = format(new Date(Number(sub.timestamp) / 1000000), 'yyyy-MM-dd');
    if (dailyCounts[date] !== undefined) {
      dailyCounts[date]++;
    }
  });

  return Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));
}

export function calculateTopAreas(items: Array<{ area?: string | null }>) {
  const areaCounts: Record<string, number> = {};

  items.forEach((item) => {
    const area = item.area || 'Unspecified';
    areaCounts[area] = (areaCounts[area] || 0) + 1;
  });

  return Object.entries(areaCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function calculateApprovalRate(kaizens: Kaizen[]) {
  if (kaizens.length === 0) return 0;
  
  const decidedKaizens = kaizens.filter(
    (k) => k.status !== 'submitted'
  );
  
  if (decidedKaizens.length === 0) return 0;
  
  const approvedKaizens = kaizens.filter(
    (k) => k.status === 'approved' || k.status === 'assigned' || k.status === 'inProgress' || k.status === 'implemented' || k.status === 'closed'
  );
  
  return (approvedKaizens.length / decidedKaizens.length) * 100;
}

export function calculateAverageTimeToDecision(kaizens: Kaizen[]) {
  const decidedKaizens = kaizens.filter(
    (k) => k.status === 'approved' || k.status === 'rejected'
  );

  if (decidedKaizens.length === 0) return 0;

  const totalDays = decidedKaizens.reduce((sum, k) => {
    const submittedTime = Number(k.timestamp) / 1000000;
    const decidedTime = Number(k.lastUpdate) / 1000000;
    const days = (decidedTime - submittedTime) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);

  return totalDays / decidedKaizens.length;
}

export function identifyLowActivitySegments(
  items: Array<{ area?: string | null; timestamp: bigint }>,
  field: 'area'
) {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentItems = items.filter((item) => Number(item.timestamp) / 1000000 >= thirtyDaysAgo);

  const segmentCounts: Record<string, number> = {};
  recentItems.forEach((item) => {
    const segment = item.area || 'Unspecified';
    segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
  });

  const segments = Object.entries(segmentCounts).map(([name, count]) => ({ name, count }));
  
  if (segments.length === 0) return [];

  segments.sort((a, b) => a.count - b.count);
  const quartileIndex = Math.floor(segments.length * 0.25);
  
  return segments.slice(0, Math.max(1, quartileIndex));
}
