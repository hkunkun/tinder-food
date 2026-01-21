import { MealDBMeal, Meal, Category, Area, toMeal } from '@/types';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Simple in-memory cache with TTL
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache<T>(url: string): Promise<T> {
    const cached = cache.get(url);
    if (cached && cached.expires > Date.now()) {
        return cached.data as T;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    cache.set(url, { data, expires: Date.now() + CACHE_TTL });
    return data as T;
}

// Fetch all categories
export async function fetchCategories(): Promise<Category[]> {
    const data = await fetchWithCache<{ categories: Category[] }>(
        `${BASE_URL}/categories.php`
    );
    return data.categories || [];
}

// Fetch all areas (countries/cuisines)
export async function fetchAreas(): Promise<Area[]> {
    const data = await fetchWithCache<{ meals: Area[] }>(
        `${BASE_URL}/list.php?a=list`
    );
    return data.meals || [];
}

// Fetch meals by category (returns basic info, need to fetch full details)
export async function fetchMealsByCategory(category: string): Promise<Meal[]> {
    const data = await fetchWithCache<{ meals: { idMeal: string; strMeal: string; strMealThumb: string }[] | null }>(
        `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`
    );

    if (!data.meals) return [];

    // Fetch full details for each meal (in parallel, max 10 at a time)
    const mealPromises = data.meals.slice(0, 15).map(m => fetchMealById(m.idMeal));
    const meals = await Promise.all(mealPromises);
    return meals.filter((m): m is Meal => m !== null);
}

// Fetch meals by area/cuisine (returns basic info)
export async function fetchMealsByArea(area: string): Promise<Meal[]> {
    const data = await fetchWithCache<{ meals: { idMeal: string; strMeal: string; strMealThumb: string }[] | null }>(
        `${BASE_URL}/filter.php?a=${encodeURIComponent(area)}`
    );

    if (!data.meals) return [];

    // Fetch full details for each meal
    const mealPromises = data.meals.slice(0, 15).map(m => fetchMealById(m.idMeal));
    const meals = await Promise.all(mealPromises);
    return meals.filter((m): m is Meal => m !== null);
}

// Fetch full meal details by ID
export async function fetchMealById(id: string): Promise<Meal | null> {
    try {
        const data = await fetchWithCache<{ meals: MealDBMeal[] | null }>(
            `${BASE_URL}/lookup.php?i=${id}`
        );

        if (!data.meals || data.meals.length === 0) return null;
        return toMeal(data.meals[0]);
    } catch {
        console.error(`Failed to fetch meal ${id}`);
        return null;
    }
}

// Fetch a random meal
export async function fetchRandomMeal(): Promise<Meal | null> {
    // Don't cache random meals
    const response = await fetch(`${BASE_URL}/random.php`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.meals || data.meals.length === 0) return null;
    return toMeal(data.meals[0]);
}

// Fetch multiple random meals (one at a time since free API doesn't support bulk)
export async function fetchRandomMeals(count: number): Promise<Meal[]> {
    const meals: Meal[] = [];
    const seenIds = new Set<string>();

    // Try to get unique meals
    for (let i = 0; i < count * 2 && meals.length < count; i++) {
        const meal = await fetchRandomMeal();
        if (meal && !seenIds.has(meal.id)) {
            seenIds.add(meal.id);
            meals.push(meal);
        }
    }

    return meals;
}

// Search meals by name
export async function searchMeals(query: string): Promise<Meal[]> {
    const data = await fetchWithCache<{ meals: MealDBMeal[] | null }>(
        `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`
    );

    if (!data.meals) return [];
    return data.meals.map(toMeal);
}

// Clear cache (useful for refresh)
export function clearCache(): void {
    cache.clear();
}
