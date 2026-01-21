import { UserPreferences, Meal, SwipeRecord, SwipeAction } from '@/types';

const STORAGE_KEY = 'tinder-food-preferences';

const defaultPreferences: UserPreferences = {
    likes: [],
    dislikes: [],
    superLikes: [],
    history: [],
    selectedCuisines: [],
    lastSessionDate: new Date().toISOString().split('T')[0],
};

// Get preferences from localStorage
export function getPreferences(): UserPreferences {
    if (typeof window === 'undefined') return defaultPreferences;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return defaultPreferences;

        const parsed = JSON.parse(stored) as UserPreferences;
        return { ...defaultPreferences, ...parsed };
    } catch {
        console.error('Failed to parse preferences from localStorage');
        return defaultPreferences;
    }
}

// Save preferences to localStorage
export function savePreferences(preferences: UserPreferences): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
        console.error('Failed to save preferences to localStorage');
    }
}

// Add a swipe action
export function addSwipe(
    preferences: UserPreferences,
    meal: Meal,
    action: SwipeAction
): UserPreferences {
    const record: SwipeRecord = {
        mealId: meal.id,
        action,
        timestamp: Date.now(),
    };

    const newPreferences = { ...preferences };
    newPreferences.history = [...preferences.history, record];

    switch (action) {
        case 'like':
            newPreferences.likes = [...preferences.likes, meal];
            break;
        case 'nope':
            newPreferences.dislikes = [...preferences.dislikes, meal];
            break;
        case 'superlike':
            newPreferences.superLikes = [...preferences.superLikes, meal];
            newPreferences.likes = [...preferences.likes, meal]; // Also add to likes
            break;
    }

    return newPreferences;
}

// Undo last swipe
export function undoLastSwipe(preferences: UserPreferences): {
    preferences: UserPreferences;
    restoredMeal: Meal | null;
} {
    if (preferences.history.length === 0) {
        return { preferences, restoredMeal: null };
    }

    const lastRecord = preferences.history[preferences.history.length - 1];
    const newPreferences = { ...preferences };
    newPreferences.history = preferences.history.slice(0, -1);

    let restoredMeal: Meal | null = null;

    switch (lastRecord.action) {
        case 'like':
            restoredMeal = preferences.likes.find(m => m.id === lastRecord.mealId) || null;
            newPreferences.likes = preferences.likes.filter(m => m.id !== lastRecord.mealId);
            break;
        case 'nope':
            restoredMeal = preferences.dislikes.find(m => m.id === lastRecord.mealId) || null;
            newPreferences.dislikes = preferences.dislikes.filter(m => m.id !== lastRecord.mealId);
            break;
        case 'superlike':
            restoredMeal = preferences.superLikes.find(m => m.id === lastRecord.mealId) || null;
            newPreferences.superLikes = preferences.superLikes.filter(m => m.id !== lastRecord.mealId);
            newPreferences.likes = preferences.likes.filter(m => m.id !== lastRecord.mealId);
            break;
    }

    return { preferences: newPreferences, restoredMeal };
}

// Reset all preferences
export function resetPreferences(): UserPreferences {
    const fresh = { ...defaultPreferences, lastSessionDate: new Date().toISOString().split('T')[0] };
    savePreferences(fresh);
    return fresh;
}

// Get count of swipes in current session
export function getSwipeCount(preferences: UserPreferences): number {
    return preferences.likes.length + preferences.dislikes.length + preferences.superLikes.length;
}

// Get all swiped meal IDs (to avoid showing again)
export function getSwipedMealIds(preferences: UserPreferences): Set<string> {
    const ids = new Set<string>();
    preferences.likes.forEach(m => ids.add(m.id));
    preferences.dislikes.forEach(m => ids.add(m.id));
    preferences.superLikes.forEach(m => ids.add(m.id));
    return ids;
}

// Update selected cuisines
export function updateSelectedCuisines(
    preferences: UserPreferences,
    cuisines: string[]
): UserPreferences {
    return { ...preferences, selectedCuisines: cuisines };
}
