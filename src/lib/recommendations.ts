import { Meal, UserPreferences, RecommendationScore } from '@/types';

// Weight constants for scoring
// Increased cuisine weight as it's a strong signal (e.g., Italian, Japanese)
// Decreased time weight as it's often irrelevant for general browsing
const WEIGHTS = {
    cuisine: 0.45,
    ingredient: 0.30,
    diet: 0.20,
    time: 0.05,
};

// Common pantry staples to ignore in ingredient matching to reduce noise
const IGNORED_INGREDIENTS = [
    'water', 'salt', 'pepper', 'oil', 'sugar', 'flour', 'butter', 'garlic', 'onion',
    'olive oil', 'vegetable oil', 'milk', 'egg', 'eggs', 'sauce', 'vinegar', 'soy sauce'
];

// Diet-related ingredient categories
const MEAT_INGREDIENTS = ['chicken', 'beef', 'pork', 'lamb', 'bacon', 'turkey', 'duck', 'ham', 'sausage'];
const SEAFOOD_INGREDIENTS = ['fish', 'salmon', 'tuna', 'shrimp', 'prawns', 'crab', 'lobster', 'cod', 'sardines'];
const VEGETARIAN_CATEGORIES = ['Vegetarian', 'Vegan', 'Side', 'Pasta', 'Starter'];

// Time-appropriate meal categories
const BREAKFAST_CATEGORIES = ['Breakfast', 'Dessert'];
const LUNCH_CATEGORIES = ['Pasta', 'Side', 'Starter', 'Vegetarian', 'Sandwich'];
const DINNER_CATEGORIES = ['Beef', 'Chicken', 'Lamb', 'Pork', 'Seafood', 'Goat', 'Miscellaneous'];

function getTimeOfDay(): 'breakfast' | 'lunch' | 'dinner' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 17) return 'lunch';
    return 'dinner';
}

// Calculate cuisine score based on liked AND disliked areas/categories
function calculateCuisineScore(meal: Meal, preferences: UserPreferences): number {
    const likedMeals = [...preferences.likes, ...preferences.superLikes];
    const dislikedMeals = preferences.dislikes;

    // Base score
    if (likedMeals.length === 0) return 0.5;

    // Helper to count frequency
    const getFrequency = (meals: Meal[], property: keyof Meal, value: string) =>
        meals.filter(m => m[property] === value).length;

    const likedAreaCount = getFrequency(likedMeals, 'area', meal.area);
    const likedCategoryCount = getFrequency(likedMeals, 'category', meal.category);

    const dislikedAreaCount = getFrequency(dislikedMeals, 'area', meal.area);
    const dislikedCategoryCount = getFrequency(dislikedMeals, 'category', meal.category);

    const totalLikes = likedMeals.length + preferences.superLikes.length; // Double weight for superlikes effectively

    // Calculate affinity (0 to 1)
    // We give a bonus for SuperLikes
    const superLikeBonus = preferences.superLikes.some(m => m.area === meal.area || m.category === meal.category) ? 0.2 : 0;

    let score = ((likedAreaCount + likedCategoryCount) / (Math.max(1, totalLikes) * 0.8)) + superLikeBonus;

    // Penalize if strongly present in dislikes
    if (dislikedAreaCount > 0 || dislikedCategoryCount > 0) {
        const dislikeFactor = (dislikedAreaCount + dislikedCategoryCount) / Math.max(1, dislikedMeals.length);
        score -= (dislikeFactor * 0.5); // Reduce score by up to 50% based on dislikes
    }

    return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
}

// Calculate ingredient score based on meaningful ingredients
function calculateIngredientScore(meal: Meal, preferences: UserPreferences): number {
    const likedMeals = [...preferences.likes, ...preferences.superLikes];
    if (likedMeals.length === 0) return 0.5;

    // function to filter noisy ingredients
    const isSignificant = (ing: string) => !IGNORED_INGREDIENTS.some(ignored => ing.includes(ignored));

    // Collect significant ingredients from liked meals
    const likedIngredients = new Set<string>();
    likedMeals.forEach(m => {
        m.ingredients.forEach(ing => {
            const normalized = ing.toLowerCase();
            if (isSignificant(normalized)) {
                likedIngredients.add(normalized);
            }
        });
    });

    const dislikedIngredients = new Set<string>();
    preferences.dislikes.forEach(m => {
        m.ingredients.forEach(ing => {
            const normalized = ing.toLowerCase();
            if (isSignificant(normalized)) {
                dislikedIngredients.add(normalized);
            }
        });
    });

    // Score this meal
    let matchCount = 0;
    let conflictCount = 0;
    let totalSignificantIngredients = 0;

    meal.ingredients.forEach(ing => {
        const normalized = ing.toLowerCase();
        if (isSignificant(normalized)) {
            totalSignificantIngredients++;
            if (likedIngredients.has(normalized)) matchCount++;
            if (dislikedIngredients.has(normalized)) conflictCount++;
        }
    });

    if (totalSignificantIngredients === 0) return 0.5; // Neutral if only common ingredients

    // Calculate score: Matches increase score, conflicts reduce it
    let score = (matchCount / totalSignificantIngredients);

    // Penalize conflicts
    if (conflictCount > 0) {
        score -= (conflictCount / totalSignificantIngredients) * 0.5;
    }

    return Math.max(0, Math.min(1, score));
}

// Calculate diet preference score
function calculateDietScore(meal: Meal, preferences: UserPreferences): number {
    const likedMeals = [...preferences.likes, ...preferences.superLikes];
    if (likedMeals.length === 0) return 0.5;

    // Analyze dietary patterns
    let meatCount = 0;
    let seafoodCount = 0;
    let vegetarianCount = 0;

    likedMeals.forEach(m => {
        const hasMatch = (ingredients: string[], patterns: string[]) =>
            ingredients.some(i => patterns.some(p => i.toLowerCase().includes(p)));

        if (hasMatch(m.ingredients, MEAT_INGREDIENTS)) meatCount++;
        if (hasMatch(m.ingredients, SEAFOOD_INGREDIENTS)) seafoodCount++;
        if (VEGETARIAN_CATEGORIES.includes(m.category)) vegetarianCount++;
    });

    const total = likedMeals.length;
    const meatRatio = meatCount / total;
    const seafoodRatio = seafoodCount / total;
    const vegRatio = vegetarianCount / total;

    // Check what this meal has
    const mealHasMeat = meal.ingredients.some(i =>
        MEAT_INGREDIENTS.some(m => i.toLowerCase().includes(m))
    );
    const mealHasSeafood = meal.ingredients.some(i =>
        SEAFOOD_INGREDIENTS.some(s => i.toLowerCase().includes(s))
    );
    const mealIsVegetarian = VEGETARIAN_CATEGORIES.includes(meal.category) || (!mealHasMeat && !mealHasSeafood);

    let score = 0.5;

    // Boost or penalize based on diet patterns
    // If user likes meat (ratio > 0.5) and meal has meat -> Boost
    if (mealHasMeat) {
        if (meatRatio > 0.6) score += 0.4;
        else if (meatRatio < 0.2) score -= 0.3; // User rarely eats meat
    }

    if (mealHasSeafood) {
        if (seafoodRatio > 0.4) score += 0.4;
        else if (seafoodRatio < 0.1) score -= 0.2; // User rarely eats seafood
    }

    if (mealIsVegetarian) {
        if (vegRatio > 0.5) score += 0.4;
    }

    return Math.max(0, Math.min(1, score));
}

// Calculate time-of-day appropriateness score
function calculateTimeScore(meal: Meal): number {
    const timeOfDay = getTimeOfDay();

    let appropriateCategories: string[];
    switch (timeOfDay) {
        case 'breakfast':
            appropriateCategories = BREAKFAST_CATEGORIES;
            break;
        case 'lunch':
            appropriateCategories = LUNCH_CATEGORIES;
            break;
        case 'dinner':
        default:
            appropriateCategories = DINNER_CATEGORIES;
            break;
    }

    if (appropriateCategories.includes(meal.category)) {
        return 1.0;
    }

    // Neutral for meals that could work anytime
    return 0.5;
}

// Generate match reasons for display
function generateMatchReasons(
    meal: Meal,
    preferences: UserPreferences,
    breakdown: RecommendationScore['breakdown']
): string[] {
    const reasons: string[] = [];

    // Cuisine reason
    const likedFromArea = preferences.likes.filter(m => m.area === meal.area).length;
    if (likedFromArea > 0) {
        reasons.push(`You liked ${likedFromArea} ${meal.area} dishes`);
    }

    // Category reason
    const likedFromCategory = preferences.likes.filter(m => m.category === meal.category).length;
    if (likedFromCategory > 1) {
        reasons.push(`Similar to ${likedFromCategory} ${meal.category} dishes you liked`);
    }

    // Ingredient reason (only if significant)
    if (breakdown.ingredientScore > 0.6) {
        reasons.push('Contains ingredients you enjoy');
    }

    // Diet reason
    if (breakdown.dietScore > 0.8) {
        reasons.push('Matches your dietary preferences');
    }

    // Superlike reason
    if (preferences.superLikes.some(m => m.area === meal.area)) {
        reasons.push(`Matches your Super Like!`);
    }

    return reasons.slice(0, 3); // Max 3 reasons
}

// Main recommendation function
export function generateRecommendations(
    candidateMeals: Meal[],
    preferences: UserPreferences,
    limit: number = 5
): RecommendationScore[] {
    // Filter out already swiped meals (likes, dislikes, superlikes)
    const swipedIds = new Set([
        ...preferences.likes.map(m => m.id),
        ...preferences.dislikes.map(m => m.id),
        ...preferences.superLikes.map(m => m.id),
    ]);

    const unseenMeals = candidateMeals.filter(m => !swipedIds.has(m.id));

    // Score each meal
    const scored: RecommendationScore[] = unseenMeals.map(meal => {
        const cuisineScore = calculateCuisineScore(meal, preferences);
        const ingredientScore = calculateIngredientScore(meal, preferences);
        const dietScore = calculateDietScore(meal, preferences);
        const timeScore = calculateTimeScore(meal);

        const totalScore =
            cuisineScore * WEIGHTS.cuisine +
            ingredientScore * WEIGHTS.ingredient +
            dietScore * WEIGHTS.diet +
            timeScore * WEIGHTS.time;

        const breakdown = { cuisineScore, ingredientScore, dietScore, timeScore };
        const matchReasons = generateMatchReasons(meal, preferences, breakdown);

        return {
            meal,
            totalScore,
            breakdown,
            matchReasons,
        };
    });

    // Sort by score and return top results
    return scored
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, limit);
}

// Get recommendation percentage for display
export function getMatchPercentage(score: RecommendationScore): number {
    return Math.round(score.totalScore * 100);
}
