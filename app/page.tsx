"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { estimateAIR } from "../lib/rankPredictor";
import { predictColleges } from "../lib/collegePredictor";

type Category = "UR" | "EWS" | "OBC" | "SC" | "ST";

export default function Home() {
  const [score, setScore] = useState("");
  const [category, setCategory] = useState<Category>("UR");
  const [homeState, setHomeState] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [favoriteColleges, setFavoriteColleges] = useState<
  (string | number)[]
>([]); 
useEffect(() => {
  const saved = JSON.parse(
    localStorage.getItem("favoriteColleges") || "[]"
  );

  setFavoriteColleges(saved);
}, []);

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [predictedRank, setPredictedRank] = useState<number | null>(null);
  const [results, setResults] = useState<any>(null);
  const [formStartTracked, setFormStartTracked] = useState(false);
  const handleFormStart = () => {
  if (!formStartTracked) {
    posthog.capture("form_start", {
      utm_source: new URLSearchParams(window.location.search).get("utm_source"),
    });

    setFormStartTracked(true);
  }
};
  const handleCheckChances = () => {
    const numericScore = Number(score);

    if (!score || numericScore < 0 || numericScore > 720) {
      alert("Please enter a valid NEET score between 0 and 720.");
      return;
    }

    if (!homeState) {
      alert("Please select your home state.");
      return;
    }

    const air = estimateAIR(numericScore);

    if (air === null) {
      alert(
        "Our current 2025 score-to-rank data supports scores from 144 to 686."
      );
      return;
    }

    setPredictedRank(air);

    const collegeResults = predictColleges(
      air,
      category,
      homeState
    );

    setResults(collegeResults);
    setShowLeadForm(true);
  };

const handleLeadSubmit = async () => {
  if (isSubmitting) return;

  if (!name.trim()) {
    alert("Please enter your name.");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    alert("Please enter a valid 10-digit Indian mobile number.");
    return;
  }

  if (predictedRank === null || !results) {
    alert("Please check your college chances first.");
    return;
  }

  setIsSubmitting(true);


  try {
    const params = new URLSearchParams(window.location.search);

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        phone,
        score: Number(score),
        category,
        homeState,
        predictedRank,
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        is_test: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to save your details.");
    }

    setShowLeadForm(false);
    setShowResults(true);
    posthog.capture("form_submit", {
  score_band:
    Number(score) >= 600 ? "600+" :
    Number(score) >= 500 ? "500-599" :
    Number(score) >= 400 ? "400-499" :
    "below_400",
  category,
  state: homeState,
  utm_source: params.get("utm_source"),
});
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again."
    );
  }finally {
  setIsSubmitting(false);
}
};

useEffect(() => {
  if (showResults && results) {
    posthog.capture("result_view", {
      safe_count: results.safe.length,
      moderate_count: results.moderate.length,
      reach_count: results.reach.length,
    });
  }
}, [showResults, results]);
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <div className="text-xl font-bold">
            NEET<span className="text-cyan-400">prep</span>
          </div>

          <div className="text-sm text-slate-400">
            College Predictor
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-5xl px-5 pb-20 pt-14">

        {!showResults && (
          <>
            {/* Hero */}
            <div className="text-center">
              <div className="mb-5 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                2025 counselling data • AIQ
              </div>

              <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
                Where can your
                <span className="block text-cyan-400">
                  NEET score take you?
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-slate-400">
                Get your estimated All India Rank and discover
                government medical colleges you may have a chance of getting.
              </p>
            </div>

            {/* Predictor Card */}
            {!showLeadForm && (
              <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-8">

                <h2 className="text-xl font-semibold">
                  Check your college chances
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Enter your NEET details to get started.
                </p>

                {/* Score */}
                <div className="mt-6">
                  <label className="mb-2 block text-sm font-medium">
                    NEET Score
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="720"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Enter your score (0–720)"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Category */}
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as Category)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 outline-none focus:border-cyan-400"
                  >
                    <option value="UR">General</option>
                    <option value="EWS">EWS</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>

                {/* Home State */}
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium">
                    Home State
                  </label>

                  <select
                    value={homeState}
                    onChange={(e) => setHomeState(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 outline-none focus:border-cyan-400"
                  >
                    <option value="">Select your state</option>
                    <option>Andhra Pradesh</option>
                    <option>Assam</option>
                    <option>Bihar</option>
                    <option>Chandigarh</option>
                    <option>Chhattisgarh</option>
                    <option>Delhi</option>
                    <option>Gujarat</option>
                    <option>Haryana</option>
                    <option>Himachal Pradesh</option>
                    <option>Jammu & Kashmir</option>
                    <option>Jharkhand</option>
                    <option>Karnataka</option>
                    <option>Kerala</option>
                    <option>Madhya Pradesh</option>
                    <option>Maharashtra</option>
                    <option>Odisha</option>
                    <option>Punjab</option>
                    <option>Rajasthan</option>
                    <option>Tamil Nadu</option>
                    <option>Telangana</option>
                    <option>Uttar Pradesh</option>
                    <option>Uttarakhand</option>
                    <option>West Bengal</option>
                  </select>
                </div>

                <button
                  onClick={handleCheckChances}
                  className="mt-7 w-full rounded-xl bg-cyan-400 px-5 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Check My College Chances →
                </button>
              </div>
            )}

            {/* Lead Gate */}
            {showLeadForm && (
              <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-cyan-400/20 bg-white/[0.04] p-6 shadow-2xl sm:p-8">

                <div className="text-center">
                  <div className="text-3xl">🎯</div>

                  <h2 className="mt-3 text-2xl font-bold">
                    Your college matches are ready!
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Enter your details to unlock your personalized results.
                  </p>
                </div>

                {/* Name */}
                <div className="mt-7">
                  <label className="mb-2 block text-sm font-medium">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
  setName(e.target.value);
  handleFormStart();
}}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Phone */}
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium">
                    Mobile Number
                  </label>

                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) =>{
                      setPhone(e.target.value.replace(/\D/g, ""))
                      handleFormStart();
                    }}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 outline-none focus:border-cyan-400"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    We'll use this number to share your result and NEET
                    counselling updates.
                  </p>
                </div>

                
<button
  onClick={handleLeadSubmit}
  disabled={isSubmitting}
  className="mt-6 w-full rounded-xl bg-cyan-400 px-5 py-4 font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
>
  {isSubmitting ? "Submitting..." : "Show My Results →"}
</button>

              </div>
            )}
          </>
        )}

        {/* Results */}
        {showResults && results && (
         <div className="animate-[fadeIn_0.6s_ease-out]">
  <div className="text-center">
              <div className="text-sm text-cyan-400">
                YOUR NEET SNAPSHOT
              </div>

              <h1 className="mt-3 text-4xl font-bold">
                Your College Chances
              </h1>
            </div>
            
<button
  onClick={() => {
    const message = [
      "🎓 My NEET College Prediction",
      `NEET Score: ${score}`,
      `Estimated AIR: ${predictedRank?.toLocaleString()}`,
      `Category: ${category === "UR" ? "General" : category}`,
      `Home State: ${homeState}`,
      "",
      "Check your college chances:",
      window.location.origin,
    ].join("\n");

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }}
  className="mx-auto mt-6 flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-400"
>
  <span>💬</span>
  Share on WhatsApp
</button>


            {/* Snapshot */}
            <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
                <p className="text-sm text-slate-400">
                  NEET Score
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {score}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
                <p className="text-sm text-slate-400">
                  Estimated AIR
                </p>
                <p className="mt-2 text-3xl font-bold text-cyan-400">
                  {predictedRank?.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
                <p className="text-sm text-slate-400">
                  Category
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {category === "UR" ? "General" : category}
                </p>
              </div>

            </div>

            {/* Safe */}
            <ResultSection
              title="Safe"
              emoji="🟢"
              colleges={results.safe}
            />

            {/* Moderate */}
            <ResultSection
              title="Moderate"
              emoji="🟡"
              colleges={results.moderate}
            />

            {/* Reach */}
            <ResultSection
              title="Reach"
              emoji="🟠"
              colleges={results.reach}
            />
            
{/* Compare Colleges */}
<div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-6">
  <h2 className="text-2xl font-bold">
    ⚖️ Compare Colleges
  </h2>

  <p className="mt-2 text-sm text-slate-400">
    Compare college options based on their category and 2025 closing ranks.
  </p>

  <div className="mt-5 space-y-3">
    {[...results.safe, ...results.moderate, ...results.reach]
      .map((college: any) => ({
        ...college,
        group: results.safe.some((c: any) => c.id === college.id)
          ? "Safe"
          : results.moderate.some((c: any) => c.id === college.id)
          ? "Moderate"
          : "Reach",
      }))
      .filter(
        (college: any, index: number, arr: any[]) =>
          arr.findIndex((c: any) => c.id === college.id) === index
      )
      .slice(0, 6)
      .map((college: any) => (
        <div
          key={college.id}
          className="flex flex-col justify-between gap-2 rounded-xl border border-white/10 p-4 sm:flex-row sm:items-center"
        >
          <div>
            <h3 className="font-semibold">{college.college}</h3>
            <p className="mt-1 text-sm text-slate-400">
              {college.city}, {college.state}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-sm text-cyan-300">{college.group}</p>
            <p className="text-xs text-slate-400">
              Closing rank: {college.closingRank.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
  </div>
</div>

{/* Favourite Colleges */}
<div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-6">
  <h2 className="text-2xl font-bold">
    ⭐ Favourite Colleges
  </h2>

  <p className="mt-2 text-sm text-slate-400">
    Save colleges from your predictions to create a shortlist.
  </p>

  <div className="mt-5 space-y-3">
    {[...results.safe, ...results.moderate, ...results.reach]
      .filter(
        (college: any, index: number, arr: any[]) =>
          arr.findIndex((c: any) => c.id === college.id) === index
      )
      .map((college: any) => (
        <div
          key={college.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-4"
        >
          <div>
            <h3 className="font-semibold">{college.college}</h3>
            <p className="mt-1 text-sm text-slate-400">
              {college.city}, {college.state}
            </p>
          </div>

          <button
  onClick={() => {
    const saved = JSON.parse(
      localStorage.getItem("favoriteColleges") || "[]"
    );

    const isSaved = saved.includes(college.id);

    const updated = isSaved
      ? saved.filter((id: string | number) => id !== college.id)
      : [...saved, college.id];

    localStorage.setItem(
      "favoriteColleges",
      JSON.stringify(updated)
    );

    setFavoriteColleges(updated);
  }}
  className={`rounded-lg border px-3 py-2 text-sm transition ${
    favoriteColleges.includes(college.id)
      ? "border-red-500/30 bg-red-500/10 text-red-400"
      : "border-white/10 text-slate-300 hover:text-red-400"
  }`}
>
  {favoriteColleges.includes(college.id)
    ? "❤️ Saved"
    : "♡ Save Favourite"}
</button>
        </div>
      ))}
  </div>

  <p className="mt-4 text-xs text-slate-500">
    Favourites are saved in this browser on this device.
  </p>
</div>


{/* Counselling Checklist */}
<div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-6">
  <h2 className="text-2xl font-bold">
    📋 Counselling Checklist
  </h2>

  <p className="mt-2 text-sm text-slate-400">
    Track your admission preparation steps. Confirm the latest requirements
    on official counselling websites.
  </p>

  <div className="mt-5 space-y-3">
    {[
      "Check official counselling notifications",
      "Keep NEET scorecard and admit card ready",
      "Prepare identity and applicable category certificates",
      "Review college choices and eligibility",
      "Complete registration and choice filling during the official window",
      "Check allotment results and reporting instructions",
    ].map((item) => (
      <label
        key={item}
        className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3"
      >
        <input
          type="checkbox"
          className="mt-1 accent-cyan-400"
        />
        <span className="text-sm text-slate-200">{item}</span>
      </label>
    ))}
  </div>

  <a
    href="https://mcc.nic.in/"
    target="_blank"
    rel="noopener noreferrer"
    className="mt-5 inline-flex rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
  >
    Check Official MCC Website →
  </a>
</div>

{/* Feedback Section */}
<div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-6">
  <h2 className="text-2xl font-bold">
    💬 Help Us Improve
  </h2>

  <p className="mt-2 text-sm text-slate-400">
    How useful was your NEET college prediction experience?
  </p>

  <div className="mt-5 flex flex-wrap gap-3">
    {[
      { label: "Very useful", value: "very_useful" },
      { label: "Somewhat useful", value: "somewhat_useful" },
      { label: "Not useful", value: "not_useful" },
    ].map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => {
          posthog.capture("predictor_feedback", {
            feedback: option.value,
            category,
            score_band:
              Number(score) >= 600
                ? "600+"
                : Number(score) >= 500
                ? "500-599"
                : Number(score) >= 400
                ? "400-499"
                : "below_400",
          });
          alert("Thanks for your feedback!");
        }}
        className="rounded-xl border border-white/10 px-4 py-3 text-sm transition hover:border-cyan-400 hover:bg-cyan-400/10"
      >
        {option.label}
      </button>
    ))}
  </div>

  <p className="mt-4 text-xs text-slate-500">
    Feedback helps us improve the experience. Please verify college
    predictions with official counselling information.
  </p>
</div>



            <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-5 text-slate-500">
              Disclaimer: College predictions are indicative estimates based
              on the provided NEET 2025 AIQ closing-rank data and approximate
              score-to-rank mappings. They are not official counselling advice.
            </p>
            
<div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6 text-center">
  <h2 className="text-xl font-bold">
    Ready for the next step? 🎓
  </h2>
  <p className="mt-2 text-sm text-slate-400">
    Review official counselling schedules, eligibility and choice-filling instructions before making admission decisions.
  </p>
  <a
    href="https://mcc.nic.in/"
    target="_blank"
    rel="noopener noreferrer"
    className="mt-5 inline-flex rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
  >
    Visit Official MCC Counselling →
  </a>
</div>

          </div>
        )}
      </section>
    </main>
  );
}

function ResultSection({
  title,
  emoji,
  colleges,
}: {
  title: string;
  emoji: string;
  colleges: any[];
}) {
  return (
    <section className="mx-auto mt-10 max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {emoji} {title}
        </h2>

        <span className="text-sm text-slate-500">
          {colleges.length} colleges
        </span>
      </div>

      {colleges.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-slate-400">
          No colleges found in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {colleges.map((college) => (
            <div
              key={college.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h3 className="font-semibold">
                    {college.college}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {college.city}, {college.state}
                  </p>

                  {college.isHomeState && (
                    <span className="mt-2 inline-block rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                      ⭐ Home State
                    </span>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-500">
                    2025 Closing Rank
                  </p>

                  <p className="font-semibold">
                    {college.closingRank.toLocaleString()}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}