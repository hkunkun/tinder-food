'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Meal } from '@/types';
import {
    fetchMealsByArea,
    fetchRandomMeals,
} from '@/lib/api';

interface UseMealsOptions {
    selectedCuisines?: string[];
    excludeIds?: Set<string>;
    initialCount?: number;
}

// Allowed areas
const ALLOWED_AREAS = [
    'American',
    'Chinese',
    'Italian',
    'Japanese',
    'Thai',
    'Vietnamese',
    'Filipino'
];

export function useMeals({
    selectedCuisines = [],
    excludeIds = new Set(),
    initialCount = 20,
}: UseMealsOptions = {}) {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Use refs to avoid dependency issues
    const excludeIdsRef = useRef(excludeIds);
    const selectedCuisinesRef = useRef(selectedCuisines);

    // Update refs when values change
    useEffect(() => {
        excludeIdsRef.current = excludeIds;
    }, [excludeIds]);

    useEffect(() => {
        selectedCuisinesRef.current = selectedCuisines;
    }, [selectedCuisines]);

    // Load meals function (stable reference)
    const loadMeals = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            let allMeals: Meal[] = [];
            const selectedAreas = selectedCuisinesRef.current;
            const excluded = excludeIdsRef.current;

            // Determine which areas to fetch from
            const areasToFetch = selectedAreas.length > 0
                ? selectedAreas.filter(area => ALLOWED_AREAS.includes(area))
                : ALLOWED_AREAS;

            if (areasToFetch.length > 0) {
                // Fetch from selected or all allowed areas
                const promises = areasToFetch.map(area => fetchMealsByArea(area));
                const results = await Promise.all(promises);
                allMeals = results.flat();
            } else {
                // Fallback to random meals (shouldn't happen with our allowed areas)
                allMeals = await fetchRandomMeals(initialCount);
            }

            // Filter to only allowed areas and exclude already swiped meals
            const filtered = allMeals.filter(m =>
                ALLOWED_AREAS.includes(m.area) && !excluded.has(m.id)
            );
            const shuffled = shuffleArray(filtered);

            setMeals(shuffled);
            setCurrentIndex(0);
            setHasLoaded(true);
        } catch (err) {
            console.error('Failed to load meals:', err);
            setError('Failed to load meals. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [initialCount]);

    // Initial load only once
    useEffect(() => {
        if (!hasLoaded) {
            loadMeals();
        }
    }, [hasLoaded, loadMeals]);

    // Get current meal
    const currentMeal = meals[currentIndex] || null;

    // Get next few meals (for card stack preview)
    const upcomingMeals = meals.slice(currentIndex, currentIndex + 3);

    // Advance to next meal
    const nextMeal = useCallback(() => {
        setCurrentIndex(prev => prev + 1);
    }, []);

    // Add meal back to deck (for undo)
    const addMealToFront = useCallback((meal: Meal) => {
        setMeals(prev => [meal, ...prev.slice(currentIndex)]);
        setCurrentIndex(0);
    }, [currentIndex]);

    // Shuffle and restart
    const shuffle = useCallback(() => {
        setMeals(prev => shuffleArray([...prev]));
        setCurrentIndex(0);
    }, []);

    // Reload with fresh data
    const reload = useCallback(async () => {
        setHasLoaded(false);
        await loadMeals();
    }, [loadMeals]);

    // Check if we're running low on meals
    const isRunningLow = meals.length - currentIndex < 5;

    // Check if deck is empty
    const isDeckEmpty = currentIndex >= meals.length && hasLoaded;

    return {
        currentMeal,
        upcomingMeals,
        isLoading,
        error,
        nextMeal,
        addMealToFront,
        shuffle,
        reload,
        isRunningLow,
        isDeckEmpty,
        remainingCount: Math.max(0, meals.length - currentIndex),
    };
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
