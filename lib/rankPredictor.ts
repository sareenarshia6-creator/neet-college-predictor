import scoreRankData from "../data/neet_2025_score_to_rank.json";

type RankPoint = {
  score: number;
  air: number;
};

const points: RankPoint[] = scoreRankData.points;

export function estimateAIR(score: number): number | null {
  // Dataset-supported range
  if (score < 144 || score > 686) {
    return null;
  }

  // Exact score match
  const exactPoint = points.find((point) => point.score === score);

  if (exactPoint) {
    return exactPoint.air;
  }

  // Find two neighbouring anchor points
  for (let i = 0; i < points.length - 1; i++) {
    const high = points[i];
    const low = points[i + 1];

    if (score <= high.score && score >= low.score) {
      const estimatedAIR =
        high.air +
        ((score - high.score) * (low.air - high.air)) /
          (low.score - high.score);

      return Math.round(estimatedAIR);
    }
  }

  return null;
}