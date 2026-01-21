'use client';

import { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Meal, SwipeAction } from '@/types';
import { useSwipe } from '@/hooks/useSwipe';
import SwipeCard from './SwipeCard';
import styles from './CardStack.module.css';

interface CardStackProps {
    meals: Meal[];
    onSwipe: (meal: Meal, action: SwipeAction) => void;
    onDeckEmpty?: () => void;
}

export default function CardStack({ meals, onSwipe, onDeckEmpty }: CardStackProps) {
    const currentMeal = meals[0];

    const handleSwipe = useCallback((action: SwipeAction) => {
        if (currentMeal) {
            onSwipe(currentMeal, action);
        }
        if (meals.length <= 1) {
            onDeckEmpty?.();
        }
    }, [currentMeal, meals.length, onSwipe, onDeckEmpty]);

    const { cardState, handlers, swipeIndicator, triggerSwipe } = useSwipe({
        onSwipe: handleSwipe,
    });

    if (meals.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🍽️</div>
                <h3>No more dishes!</h3>
                <p>You&apos;ve seen all available meals.</p>
            </div>
        );
    }

    return (
        <div className={styles.stack}>
            <AnimatePresence mode="popLayout">
                {meals.slice(0, 3).map((meal, index) => (
                    <motion.div
                        key={meal.id}
                        className={styles.cardWrapper}
                        initial={{ scale: 1 - index * 0.05, y: index * 10 }}
                        animate={{ scale: 1 - index * 0.05, y: index * 10 }}
                        exit={{
                            x: cardState.x > 50 ? 500 : cardState.x < -50 ? -500 : 0,
                            y: cardState.y < -50 ? -500 : 0,
                            opacity: 0,
                            transition: { duration: 0.3 }
                        }}
                        style={{ zIndex: 3 - index }}
                    >
                        <SwipeCard
                            meal={meal}
                            cardState={index === 0 ? cardState : { x: 0, y: 0, rotation: 0, scale: 1 }}
                            swipeIndicator={index === 0 ? swipeIndicator : null}
                            handlers={index === 0 ? handlers : {
                                onMouseDown: () => { },
                                onMouseMove: () => { },
                                onMouseUp: () => { },
                                onMouseLeave: () => { },
                                onTouchStart: () => { },
                                onTouchMove: () => { },
                                onTouchEnd: () => { },
                            }}
                            isTop={index === 0}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Expose triggerSwipe for action buttons */}
            <div className={styles.buttonTrigger} data-trigger-swipe>
                <button onClick={() => triggerSwipe('nope')} data-action="nope" style={{ display: 'none' }} />
                <button onClick={() => triggerSwipe('like')} data-action="like" style={{ display: 'none' }} />
                <button onClick={() => triggerSwipe('superlike')} data-action="superlike" style={{ display: 'none' }} />
            </div>
        </div>
    );
}

// Helper to trigger swipe from outside
export function triggerCardSwipe(action: SwipeAction) {
    const button = document.querySelector(`[data-trigger-swipe] [data-action="${action}"]`) as HTMLButtonElement;
    button?.click();
}
