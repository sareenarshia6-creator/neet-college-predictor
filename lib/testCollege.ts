import { predictColleges } from "./collegePredictor";

const result = predictColleges(1300, "UR", "Punjab");

console.log("\nSAFE COLLEGES:");
result.safe.forEach((college) => {
  console.log(
    college.college,
    "| Closing Rank:",
    college.closingRank,
    "| Home State:",
    college.isHomeState
  );
});

console.log("\nMODERATE COLLEGES:");
result.moderate.forEach((college) => {
  console.log(
    college.college,
    "| Closing Rank:",
    college.closingRank,
    "| Home State:",
    college.isHomeState
  );
});

console.log("\nREACH COLLEGES:");
result.reach.forEach((college) => {
  console.log(
    college.college,
    "| Closing Rank:",
    college.closingRank,
    "| Home State:",
    college.isHomeState
  );
});