# NEET College Predictor

**Live app:** https://neet-college-predictor-lovat.vercel.app  
**GitHub repository:** https://github.com/sareenarshia6-creator/neet-college-predictor

A mobile-first NEET college prediction app that helps aspirants explore possible government medical college options using their NEET score, category, and home state. It estimates an All India Rank (AIR), groups possible colleges into Safe, Moderate, and Reach categories, and collects contact details before showing results.

> **Disclaimer:** Predictions are estimates based on the project's available data, not admission guarantees. Always verify current counselling rules, cutoffs, seat matrices, and allotment information with official authorities.

## Features

- NEET score input (0–720), category, and home-state selection
- Estimated AIR using included score-to-rank data and interpolation logic
- College results grouped as Safe, Moderate, and Reach
- Home-state badge for matching colleges
- Lead form with name and Indian mobile-number validation
- Lead storage through a Next.js API route and Supabase
- UTM capture for `utm_source`, `utm_medium`, and `utm_campaign`
- PostHog events for funnel and feedback tracking
- Compare colleges, save/unsave favourites, counselling checklist, and feedback controls
- WhatsApp sharing of prediction results

## Tech stack

- Next.js, React, TypeScript
- Tailwind CSS
- Supabase for lead storage
- PostHog for product analytics
- Vercel for deployment

## User flow

1. Enter NEET score, category, and home state.
2. The app estimates AIR and prepares college recommendations.
3. Submit name and a valid 10-digit Indian mobile number.
4. View Safe, Moderate, and Reach college recommendations.
5. Compare colleges, save favourites, use the counselling checklist, and optionally submit feedback.

## Analytics

| Event | Purpose |
|---|---|
| `page_view` | Measure visits |
| `form_start` | Measure predictor starts |
| `form_submit` | Measure successful lead-form submissions |
| `result_view` | Measure results views |
| `predictor_feedback` | Record feedback-button selections |

UTM parameters are read from tagged URLs and included in relevant tracking/lead data. In PostHog, distinguish unique users from total events; repeated events do not necessarily represent separate users.

## Data assumptions and limitations

- The project uses its included NEET score-to-rank and college-cutoff data, currently described in the app as 2025 counselling data.
- Rank estimation uses the project's implemented interpolation logic.
- Safe, Moderate, and Reach are app-defined categories, not official admission probabilities.
- Prediction quality depends on the completeness and accuracy of the included data.
- Favourite colleges are stored in the current browser's `localStorage` and are not synced across devices.

## Local setup

Prerequisites: Node.js, npm, Supabase project credentials, and PostHog configuration.

```bash
git clone https://github.com/sareenarshia6-creator/neet-college-predictor.git
cd neet-college-predictor
npm install
npm run dev
```

Open `http://localhost:3000`.

Configure the environment variables using the exact names referenced in the source code. Keep Supabase service-role/secret credentials server-side in environment variables. Never commit `.env` or expose secrets in client-side code, screenshots, or documentation.

## Privacy and security

- Collect contact details only with user knowledge and appropriate consent.
- Mask names and phone numbers in evidence screenshots.
- Keep secrets out of GitHub and client-side code.
- Clearly identify test records; do not present test submissions as genuine leads.
- Include a privacy notice and prediction disclaimer before public use.

## Pre-submission checklist

- [ ] Latest Vercel deployment is Ready
- [ ] Predictor works on desktop and mobile
- [ ] Lead submission is saved in Supabase
- [ ] PostHog funnel and feedback properties are verified
- [ ] UTM values are captured from a tagged link
- [ ] Favourite save/unsave and refresh persistence are tested
- [ ] Ten-user testing is documented with real tester records and feedback
- [ ] Loom demo and evidence screenshots are ready

## Demo and evidence

- **Demo video:** Add Loom URL
- **Funnel screenshot:** Add screenshot location
- **Feedback-event screenshot:** Add screenshot location
- **User-testing summary:** Add verified results

Add the licence required by the assignment/repository, if applicable.
