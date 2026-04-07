// utils/roommateMatch.js
// Computes compatibility score (0–100) between two students
const computeCompatibilityScore = (prefs1, prefs2) => {
  let score = 0;

  // Sleep schedule: 40 points
  if (prefs1.sleepSchedule === prefs2.sleepSchedule) score += 40;
  else if (prefs1.sleepSchedule === 'flexible' || prefs2.sleepSchedule === 'flexible') score += 20;

  // Food preference: 30 points
  if (prefs1.foodPreference === prefs2.foodPreference) score += 30;
  else if (prefs1.foodPreference === 'any' || prefs2.foodPreference === 'any') score += 15;

  // Lifestyle: 30 points
  if (prefs1.lifestyle === prefs2.lifestyle) score += 30;
  else if (
    (prefs1.lifestyle === 'balanced') ||
    (prefs2.lifestyle === 'balanced')
  ) score += 15;

  return score;
};

module.exports = { computeCompatibilityScore };
