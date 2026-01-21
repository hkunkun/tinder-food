'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPreferences, Meal, SwipeAction } from '@/types';
import {
    getPreferences,
    savePreferences,
    addSwipe,
    undoLastSwipe,
    resetPreferences as resetStoredPreferences,
    getSwipeCount,
    getSwipedMealIds,
    updateSelectedCuisines,
} from '@/lib/storage';

export function usePreferences() {
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load preferences on mount
    useEffect(() => {
        const stored = getPreferences();
        setPreferences(stored);
        setIsLoading(false);
    }, []);

    // Save preferences whenever they change
    useEffect(() => {
        if (preferences) {
            savePreferences(preferences);
        }
    }, [preferences]);

    // Record a swipe
    const recordSwipe = useCallback((meal: Meal, action: SwipeAction) => {
        setPreferences(prev => {
            if (!prev) return prev;
            return addSwipe(prev, meal, action);
        });
    }, []);

    // Undo last swipe
    const undo = useCallback((): Meal | null => {
        let restored: Meal | null = null;
        setPreferences(prev => {
            if (!prev) return prev;
            const result = undoLastSwipe(prev);
            restored = result.restoredMeal;
            return result.preferences;
        });
        return restored;
    }, []);

    // Reset all preferences
    const reset = useCallback(() => {
        const fresh = resetStoredPreferences();
        setPreferences(fresh);
    }, []);

    // Update selected cuisines
    const setCuisines = useCallback((cuisines: string[]) => {
        setPreferences(prev => {
            if (!prev) return prev;
            return updateSelectedCuisines(prev, cuisines);
        });
    }, []);

    // Get count of swipes
    const swipeCount = preferences ? getSwipeCount(preferences) : 0;

    // Get set of swiped meal IDs
    const swipedIds = preferences ? getSwipedMealIds(preferences) : new Set<string>();

    // Check if we have enough swipes for recommendations
    const hasEnoughSwipes = swipeCount >= 10;

    return {
        preferences,
        isLoading,
        recordSwipe,
        undo,
        reset,
        setCuisines,
        swipeCount,
        swipedIds,
        hasEnoughSwipes,
    };
}
