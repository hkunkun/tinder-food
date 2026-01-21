'use client';

import { motion } from 'framer-motion';
import { triggerCardSwipe } from './CardStack';
import styles from './ActionButtons.module.css';

interface ActionButtonsProps {
    onUndo: () => void;
    canUndo: boolean;
    disabled?: boolean;
}

export default function ActionButtons({ onUndo, canUndo, disabled = false }: ActionButtonsProps) {
    return (
        <div className={styles.container}>
            {/* Undo Button */}
            <motion.button
                className={`${styles.button} ${styles.undoButton}`}
                onClick={onUndo}
                disabled={!canUndo || disabled}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                </svg>
            </motion.button>

            {/* Nope Button */}
            <motion.button
                className={`${styles.button} ${styles.nopeButton}`}
                onClick={() => triggerCardSwipe('nope')}
                disabled={disabled}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.08 }}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </motion.button>

            {/* Super Like Button */}
            <motion.button
                className={`${styles.button} ${styles.superLikeButton}`}
                onClick={() => triggerCardSwipe('superlike')}
                disabled={disabled}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.08 }}
            >
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            </motion.button>

            {/* Like Button */}
            <motion.button
                className={`${styles.button} ${styles.likeButton}`}
                onClick={() => triggerCardSwipe('like')}
                disabled={disabled}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.08 }}
            >
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            </motion.button>
        </div>
    );
}
