'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import CardStack from '@/components/CardStack';
import ActionButtons from '@/components/ActionButtons';
import { usePreferences } from '@/hooks/usePreferences';
import { useMeals } from '@/hooks/useMeals';
import { Meal, SwipeAction } from '@/types';
import styles from './page.module.css';

const MIN_SWIPES = 10;

export default function SwipePage() {
    const router = useRouter();

    const {
        preferences,
        isLoading: prefsLoading,
        recordSwipe,
        undo,
        swipeCount,
        swipedIds,
        hasEnoughSwipes,
    } = usePreferences();

    const {
        upcomingMeals,
        isLoading: mealsLoading,
        nextMeal,
        addMealToFront,
        shuffle,
        reload,
        isDeckEmpty,
    } = useMeals({
        selectedCuisines: preferences?.selectedCuisines || [],
        excludeIds: swipedIds,
        initialCount: 30,
    });

    const handleSwipe = useCallback((meal: Meal, action: SwipeAction) => {
        recordSwipe(meal, action);
        nextMeal();
    }, [recordSwipe, nextMeal]);

    const handleUndo = useCallback(() => {
        const restoredMeal = undo();
        if (restoredMeal) {
            addMealToFront(restoredMeal);
        }
    }, [undo, addMealToFront]);

    const handleDeckEmpty = useCallback(() => {
        if (hasEnoughSwipes) {
            router.push('/results');
        }
    }, [hasEnoughSwipes, router]);

    const handleShuffle = useCallback(() => {
        shuffle();
    }, [shuffle]);

    // Loading state
    if (prefsLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader} />
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Header
                swipeCount={swipeCount}
                minSwipes={MIN_SWIPES}
                onShuffle={handleShuffle}
                showProgress
            />

            <main className={styles.main}>
                {mealsLoading && upcomingMeals.length === 0 ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loader} />
                        <p>Loading meals...</p>
                    </div>
                ) : isDeckEmpty ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🎉</div>
                        <h2>You&apos;ve seen them all!</h2>
                        <p>
                            {hasEnoughSwipes
                                ? 'Check out your personalized recommendations!'
                                : `Swipe ${MIN_SWIPES - swipeCount} more to get recommendations`}
                        </p>
                        {hasEnoughSwipes && (
                            <button
                                className={styles.resultsButton}
                                onClick={() => router.push('/results')}
                            >
                                View My Matches
                            </button>
                        )}
                        <button className={styles.reloadButton} onClick={reload}>
                            Load More Dishes
                        </button>
                    </div>
                ) : (
                    <CardStack
                        meals={upcomingMeals}
                        onSwipe={handleSwipe}
                        onDeckEmpty={handleDeckEmpty}
                    />
                )}
            </main>

            {!isDeckEmpty && (
                <div className={styles.actions}>
                    <ActionButtons
                        onUndo={handleUndo}
                        canUndo={swipeCount > 0}
                        disabled={mealsLoading || upcomingMeals.length === 0}
                    />
                </div>
            )}
        </div>
    );
}
