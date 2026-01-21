'use client';

import { motion } from 'framer-motion';
import { RecommendationScore } from '@/types';
import { getMatchPercentage } from '@/lib/recommendations';
import styles from './RecommendationCard.module.css';

interface RecommendationCardProps {
    recommendation: RecommendationScore;
    rank: number;
}

export default function RecommendationCard({ recommendation, rank }: RecommendationCardProps) {
    const { meal, matchReasons } = recommendation;
    const matchPercent = getMatchPercentage(recommendation);

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.1 }}
        >
            <div className={styles.imageContainer}>
                <img src={meal.image} alt={meal.name} className={styles.image} />
                <div className={styles.rank}>#{rank + 1}</div>
                <div className={styles.matchBadge}>
                    <span className={styles.matchPercent}>{matchPercent}%</span>
                    <span className={styles.matchLabel}>Match</span>
                </div>
            </div>

            <div className={styles.content}>
                <h3 className={styles.name}>{meal.name}</h3>

                <div className={styles.meta}>
                    <span className={styles.badge}>{meal.category}</span>
                    <span className={styles.badge}>{meal.area}</span>
                </div>

                {matchReasons.length > 0 && (
                    <div className={styles.reasons}>
                        {matchReasons.map((reason, i) => (
                            <div key={i} className={styles.reason}>
                                <span className={styles.checkIcon}>✓</span>
                                {reason}
                            </div>
                        ))}
                    </div>
                )}

                <a
                    href={`https://www.themealdb.com/meal/${meal.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.recipeLink}
                >
                    View Recipe
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                </a>
            </div>
        </motion.div>
    );
}
