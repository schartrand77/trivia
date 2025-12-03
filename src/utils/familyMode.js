/**
 * Family Mode Utilities
 * Maps player age to appropriate question difficulty levels and content
 */

/**
 * OpenTDB Category IDs that are kid-friendly
 * These categories are generally safe for children
 */
export const KIDS_FRIENDLY_CATEGORIES = [
  9,    // General Knowledge
  10,   // Entertainment: Books
  11,   // Entertainment: Film
  12,   // Entertainment: Music
  13,   // Entertainment: Musicals & Theatres
  14,   // Entertainment: Television
  15,   // Entertainment: Video Games
  17,   // Science & Nature
  18,   // Science: Computers
  21,   // Sports
  22,   // Geography
  23,   // History
  27,   // Animals
  30,   // Science: Gadgets
];

/**
 * Age ranges and their corresponding difficulty settings
 * @type {Array<{minAge: number, maxAge: number, difficulty: string, label: string}>}
 */
export const AGE_DIFFICULTY_MAP = [
  {
    minAge: 0,
    maxAge: 7,
    difficulty: 'easy',
    label: 'Very Young (4-7 years) - Easy Questions'
  },
  {
    minAge: 8,
    maxAge: 12,
    difficulty: 'easy',
    label: 'Children (8-12 years) - Easy Questions'
  },
  {
    minAge: 13,
    maxAge: 17,
    difficulty: 'medium',
    label: 'Teens (13-17 years) - Medium Questions'
  },
  {
    minAge: 18,
    maxAge: 64,
    difficulty: 'any',
    label: 'Adults (18+ years) - All Difficulty Levels'
  },
  {
    minAge: 65,
    maxAge: 150,
    difficulty: 'any',
    label: 'Seniors (65+ years) - All Difficulty Levels'
  }
];

/**
 * Get appropriate difficulty level based on player age
 * @param {number|null|undefined} age - Player's age
 * @returns {string} Difficulty level: 'easy', 'medium', 'hard', or 'any'
 */
export const getDifficultyForAge = (age) => {
  if (!age || age <= 0) {
    return 'any'; // No age set, allow all difficulties
  }

  const ageMap = AGE_DIFFICULTY_MAP.find(
    (range) => age >= range.minAge && age <= range.maxAge
  );

  return ageMap ? ageMap.difficulty : 'any';
};

/**
 * Get a descriptive label for an age
 * @param {number|null|undefined} age - Player's age
 * @returns {string} Description of the age group and difficulty
 */
export const getAgeGroupLabel = (age) => {
  if (!age || age <= 0) {
    return 'No age set - Using all difficulty levels';
  }

  const ageMap = AGE_DIFFICULTY_MAP.find(
    (range) => age >= range.minAge && age <= range.maxAge
  );

  return ageMap ? ageMap.label : 'Unknown age group - Using all difficulty levels';
};

/**
 * Check if family mode should be enforced for a player
 * @param {number|null|undefined} age - Player's age
 * @returns {boolean} True if age is set and player is under 18
 */
export const isFamilyModePlayer = (age) => {
  return age && age > 0 && age < 18;
};

/**
 * Filter categories to only kid-friendly ones for child players
 * @param {number[]} allCategoryIds - All available category IDs
 * @param {number|null|undefined} age - Player's age
 * @returns {number[]} Filtered category IDs (kid-friendly if player is a child)
 */
export const filterCategoriesForAge = (allCategoryIds, age) => {
  if (isFamilyModePlayer(age)) {
    // For children, only use kid-friendly categories
    return allCategoryIds.filter(catId => KIDS_FRIENDLY_CATEGORIES.includes(catId));
  }
  // For adults, use all categories
  return allCategoryIds;
};

