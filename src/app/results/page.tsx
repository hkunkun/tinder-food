'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import RecommendationCard from '@/components/RecommendationCard';
import { usePreferences } from '@/hooks/usePreferences';
import { useMeals } from '@/hooks/useMeals';
import { generateRecommendations } from '@/lib/recommendations';
import { RecommendationScore } from '@/types';
import styles from './page.module.css';

export default function ResultsPage() {
    const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { preferences, isLoading: prefsLoading, reset } = usePreferences();
    const { upcomingMeals, isLoading: mealsLoading } = useMeals({
        selectedCuisines: [],
        initialCount: 50,
    });

    // Generate recommendations when data is ready
    useEffect(() => {
        if (!prefsLoading && !mealsLoading && preferences && upcomingMeals.length > 0) {
            const recs = generateRecommendations(upcomingMeals, preferences, 6);
            setRecommendations(recs);
            setIsLoading(false);
        }
    }, [preferences, prefsLoading, mealsLoading, upcomingMeals]);

    const handleStartOver = () => {
        reset();
        window.location.href = '/swipe';
    };

    const likedCount = preferences?.likes.length || 0;
    const superLikedCount = preferences?.superLikes.length || 0;

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader} />
                <p>Finding your perfect matches...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Header />

            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Your Matches</h1>
                    <p className={styles.subtitle}>
                        Based on {likedCount} liked dishes
                        {superLikedCount > 0 && ` and ${superLikedCount} super likes`}
                    </p>
                </div>

                {recommendations.length > 0 ? (
                    <div className={styles.grid}>
                        {recommendations.map((rec, index) => (
                            <RecommendationCard
                                key={rec.meal.id}
                                recommendation={rec}
                                rank={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🤔</div>
                        <h3>Not enough data yet</h3>
                        <p>Swipe on more dishes to get better recommendations!</p>
                        <Link href="/swipe" className={styles.swipeButton}>
                            Continue Swiping
                        </Link>
                    </div>
                )}

                {/* Liked dishes section */}
                {preferences && preferences.likes.length > 0 && (
                    <section className={styles.likedSection}>
                        <h2 className={styles.sectionTitle}>
                            <span>❤️</span> Dishes You Liked
                        </h2>
                        <div className={styles.likedGrid}>
                            {(() => {
                                // Deduplicate by meal ID (since super-liked meals appear in both arrays)
                                const uniqueMeals = Array.from(
                                    new Map(preferences.likes.map(meal => [meal.id, meal])).values()
                                );
                                return uniqueMeals.map(meal => (
                                    <div key={meal.id} className={styles.likedCard}>
                                        <img src={meal.image} alt={meal.name} />
                                        <div className={styles.likedInfo}>
                                            <span className={styles.likedName}>{meal.name}</span>
                                            {preferences.superLikes.some(s => s.id === meal.id) && (
                                                <span className={styles.superLikeBadge}>⭐</span>
                                            )}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </section>
                )}

                <div className={styles.actions}>
                    <Link href="/swipe" className={styles.continueButton}>
                        Keep Swiping
                    </Link>
                    <button className={styles.resetButton} onClick={handleStartOver}>
                        Start Over
                    </button>
                </div>
            </main>
        </div>
    );
}
