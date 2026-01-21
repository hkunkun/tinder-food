'use client';

import { motion } from 'framer-motion';
import { Meal, SwipeAction } from '@/types';
import styles from './SwipeCard.module.css';

interface SwipeCardProps {
    meal: Meal;
    cardState: {
        x: number;
        y: number;
        rotation: number;
        scale: number;
    };
    swipeIndicator: SwipeAction | null;
    handlers: {
        onMouseDown: (e: React.MouseEvent) => void;
        onMouseMove: (e: React.MouseEvent) => void;
        onMouseUp: () => void;
        onMouseLeave: () => void;
        onTouchStart: (e: React.TouchEvent) => void;
        onTouchMove: (e: React.TouchEvent) => void;
        onTouchEnd: () => void;
    };
    isTop?: boolean;
    style?: React.CSSProperties;
}

export default function SwipeCard({
    meal,
    cardState,
    swipeIndicator,
    handlers,
    isTop = true,
    style,
}: SwipeCardProps) {
    return (
        <motion.div
            className={`${styles.card} ${isTop ? styles.topCard : ''}`}
            style={{
                ...style,
                x: isTop ? cardState.x : 0,
                y: isTop ? cardState.y : 0,
                rotate: isTop ? cardState.rotation : 0,
                scale: cardState.scale,
                backgroundImage: `url(${meal.image})`,
            }}
            {...(isTop ? handlers : {})}
            drag={false}
        >
            {/* Swipe indicators */}
            <div className={`${styles.indicator} ${styles.likeIndicator} ${swipeIndicator === 'like' ? styles.visible : ''}`}>
                LIKE
            </div>
            <div className={`${styles.indicator} ${styles.nopeIndicator} ${swipeIndicator === 'nope' ? styles.visible : ''}`}>
                NOPE
            </div>
            <div className={`${styles.indicator} ${styles.superLikeIndicator} ${swipeIndicator === 'superlike' ? styles.visible : ''}`}>
                SUPER
            </div>

            {/* Dynamic Color Overlays */}
            {isTop && (
                <>
                    <div
                        className={`${styles.overlay} ${styles.likeOverlay}`}
                        style={{ opacity: Math.min(Math.max(cardState.x / 150, 0), 0.6) }}
                    />
                    <div
                        className={`${styles.overlay} ${styles.nopeOverlay}`}
                        style={{ opacity: Math.min(Math.max(-cardState.x / 150, 0), 0.6) }}
                    />
                    <div
                        className={`${styles.overlay} ${styles.superLikeOverlay}`}
                        style={{ opacity: Math.min(Math.max(-cardState.y / 150, 0), 0.6) }}
                    />
                </>
            )}

            {/* Gradient overlay */}
            <div className={styles.gradient} />

            {/* Content */}
            <div className={styles.content}>
                <h2 className={styles.name}>{meal.name}</h2>
                <div className={styles.badges}>
                    <span className={styles.badge}>{meal.category}</span>
                    <span className={styles.badge}>{meal.area}</span>
                </div>
                {meal.tags.length > 0 && (
                    <div className={styles.tags}>
                        {meal.tags.slice(0, 3).map(tag => (
                            <span key={tag} className={styles.tag}>#{tag}</span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
