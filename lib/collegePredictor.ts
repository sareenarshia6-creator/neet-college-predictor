import collegeData from "../data/neet_2025_college_cutoffs.json";

type Category = "UR" | "EWS" | "OBC" | "SC" | "ST";

type College = {
  id: string;
  college: string;
  city: string;
  state: string;
  type: string;
  course: string;
  quota: string;
  closing_rank_2025: {
    UR: number;
    EWS: number;
    OBC: number;
    SC: number;
    ST: number;
  };
};

type ResultCollege = College & {
  closingRank: number;
  bucket: "Safe" | "Moderate" | "Reach";
  isHomeState: boolean;
};

export function predictColleges(
  estimatedAIR: number,
  category: Category,
  homeState: string
) {
  const colleges = collegeData.colleges as College[];

  const safe: ResultCollege[] = [];
  const moderate: ResultCollege[] = [];
  const reach: ResultCollege[] = [];

  colleges.forEach((college) => {
    const closingRank = college.closing_rank_2025[category];

    const ratio = estimatedAIR / closingRank;

    const result = {
      ...college,
      closingRank,
      isHomeState: college.state === homeState,
    };

    if (ratio <= 0.85) {
      safe.push({
        ...result,
        bucket: "Safe",
      });
    } else if (ratio <= 1) {
      moderate.push({
        ...result,
        bucket: "Moderate",
      });
    } else if (ratio <= 1.15) {
      reach.push({
        ...result,
        bucket: "Reach",
      });
    }
  });

  safe.sort((a, b) => a.closingRank - b.closingRank);
  moderate.sort((a, b) => a.closingRank - b.closingRank);
  reach.sort((a, b) => a.closingRank - b.closingRank);

  return {
    safe: safe.slice(0, 10),
    moderate: moderate.slice(0, 10),
    reach: reach.slice(0, 10),
  };
}