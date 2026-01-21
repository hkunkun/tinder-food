'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './CuisineFilter.module.css';

interface CuisineFilterProps {
    selectedCuisines: string[];
    onSelect: (cuisines: string[]) => void;
    onStart: () => void;
    isLoading?: boolean;
}

// Allowed cuisines/areas
const ALLOWED_AREAS = [
    'American',
    'Chinese',
    'Italian',
    'Japanese',
    'Thai',
    'Vietnamese',
    'Filipino'
];

export default function CuisineFilter({
    selectedCuisines,
    onSelect,
    onStart,
    isLoading = false,
}: CuisineFilterProps) {
    const [selectAll, setSelectAll] = useState(selectedCuisines.length === 0);

    const toggleCuisine = (cuisine: string) => {
        if (selectAll) {
            setSelectAll(false);
            onSelect([cuisine]);
        } else {
            const isSelected = selectedCuisines.includes(cuisine);
            if (isSelected) {
                const newSelection = selectedCuisines.filter(c => c !== cuisine);
                if (newSelection.length === 0) {
                    setSelectAll(true);
                    onSelect([]);
                } else {
                    onSelect(newSelection);
                }
            } else {
                onSelect([...selectedCuisines, cuisine]);
            }
        }
    };

    const toggleAll = () => {
        setSelectAll(true);
        onSelect([]);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>What are you craving?</h1>
                <p className={styles.subtitle}>Select cuisines or swipe through all</p>
            </div>

            <div className={styles.grid}>
                {/* All Cuisines Option */}
                <motion.button
                    className={`${styles.cuisineCard} ${selectAll ? styles.selected : ''}`}
                    onClick={toggleAll}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className={styles.cuisineEmoji}>🌍</span>
                    <span className={styles.cuisineName}>All Cuisines</span>
                </motion.button>

                {ALLOWED_AREAS.map(area => (
                    <motion.button
                        key={area}
                        className={`${styles.cuisineCard} ${!selectAll && selectedCuisines.includes(area) ? styles.selected : ''
                            }`}
                        onClick={() => toggleCuisine(area)}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className={styles.cuisineEmoji}>
                            {getAreaEmoji(area)}
                        </span>
                        <span className={styles.cuisineName}>{area}</span>
                    </motion.button>
                ))}
            </div>

            <motion.button
                className={styles.startButton}
                onClick={onStart}
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
            >
                {isLoading ? (
                    <span className={styles.loader} />
                ) : (
                    <>
                        Start Swiping
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </>
                )}
            </motion.button>
        </div>
    );
}

function getAreaEmoji(area: string): string {
    const emojiMap: Record<string, string> = {
        'American': '🇺🇸',
        'Chinese': '🇨🇳',
        'Italian': '🇮🇹',
        'Japanese': '🇯🇵',
        'Thai': '🇹🇭',
        'Vietnamese': '🇻🇳',
        'Filipino': '🇵🇭',
    };
    return emojiMap[area] || '🍽️';
}
