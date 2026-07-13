# Where on Kinsey?

An early, English-first skeleton for a private sexuality and attraction self-assessment.

## Current stage

- Responsive landing and profile setup screen
- Gender identity and exact age fields
- Sexual and romantic orientation reserved for separate assessment results
- 18+ consent gate
- Local-only profile persistence
- No profile transmission in the current static version (E2EE is not claimed)
- Dark theme by default with a saved light-mode option
- Inclusive hero imagery and rainbow visual identity
- A 300-item original question bank with matched response scales
- Profile-to-assessment transition with an initial question screen
- One-time assessment or future account-access choice
- Full interface, answer-scale, and 300-question localization in English, German, Polish, Russian, Spanish, Simplified Chinese, Japanese, Korean, and Portuguese
- Gender-aware question balancing without inferring or preselecting orientation
- Profile-aware grammatical gender for localized assessment wording

## Localization

The language selector stores the chosen locale on the device. All question translations are bundled in `locales.js`, so assessment text is not sent to a translation service while the user takes the test. Machine-assisted translations should receive native-speaker and subject-matter review before production use.

## Supabase account setup

The frontend is configured with the project's public Supabase URL and publishable key. Run `supabase/migrations/001_encrypted_assessments.sql` once in the Supabase SQL Editor before testing cloud saves.

Account access is passwordless and verified by an email OTP handled by Supabase Auth. A separate encryption passphrase is kept only in browser memory and derives an AES-256-GCM key through PBKDF2-SHA-256 (310,000 iterations). Completed assessment JSON is encrypted before upload; the database receives ciphertext, IV, salt, and non-secret algorithm parameters only. Losing the encryption passphrase makes the encrypted assessment unrecoverable.

### Email OTP configuration

The account flow uses `signInWithOtp` and `verifyOtp`; it creates an account automatically for a new email. In Supabase Dashboard, open **Authentication → Email Templates → Magic Link**, set a subject such as `{{ .Token }} — Where on Kinsey verification code`, and replace the template body with `supabase/templates/magic-link-otp.html`. The template must contain `{{ .Token }}` instead of `{{ .ConfirmationURL }}` or Supabase will send a magic link rather than a code.

Open `index.html` in a browser to preview it. No installation or build step is required.

## Suggested next stages

1. Define the assessment dimensions and scoring model.
2. Design the 300-question schema and write a representative first set.
3. Build the 50-question session flow and progress states.
4. Create results, explanations, privacy policy, and methodology screens.

## Methodology note

The item structure is informed by the distinction between attraction, fantasy, behavior, emotional preference, identity, and change over time found in Kinsey-, Klein-, and Sell-style approaches. Sexual and romantic attraction are measured separately, and attraction toward women, men, and non-binary people is not treated as a single bipolar variable. These original questions have not been psychometrically validated and the result must remain a preliminary self-reflection aid, not a diagnosis.

### Analysis algorithm (`wok-profile-1.1`)

- Responses are normalized from the 0–4 answer scale to 0–1.
- Each session uses a fixed, evenly distributed form drawn from the bank; only the presentation order is randomized. This prevents the score from changing solely because a different random subset of items was selected.
- Sexual target axes weight direct attraction at `1.0`, desire at `0.8`, and fantasy at `0.65`.
- Romantic target axes weight direct romantic attraction at `1.0` and emotional bonding at `0.8`.
- Behavior and experience are recorded but intentionally excluded from the core attraction score; opportunity, pressure, and circumstance can make behavior diverge from attraction.
- Every women/men/non-binary target axis is a weighted mean with a heuristic uncertainty band based on weighted variance, effective sample size, and a small-sample penalty.
- A score is displayed only when at least three applicable, answered items are available. Missing or insufficient data is shown as unavailable rather than as a zero score.
- Result stability combines answer coverage (45%), adequate target-axis coverage (30%), and within-axis consistency (25%). It is not a clinical confidence measure.
- A Kinsey-style 0–6 relative position is calculated separately for sexual and romantic attraction only for respondents identifying as a woman or man, and only when both same- and different-gender axes contain usable signal. Non-binary attraction remains a separate axis and is never folded into that number.
- The complete calculated analysis, algorithm version, inputs, timestamps, and uncertainty values are stored locally with the assessment session.
- All six target-specific components (direct sexual attraction, direct romantic attraction, fantasy, desire, experience, and emotional bonding) are calculated and stored independently for women, men, and non-binary people.
- Seven secondary coded indices are calculated: sexual-attraction presence, romantic-attraction presence, fluidity over time, bond/context dependence, self-understanding, identity complexity, and boundaries/comfort. Negatively worded items are explicitly reverse-coded by question ID.
- A dedicated localized analysis screen displays a staged animation while the profile, uncertainty, and result model are calculated.
- The assessment can be explicitly cancelled in every supported language; confirmation clears the complete active session and stops pending analysis timers.
