'use client';

import Link from 'next/link';
import styles from './Header.module.css';

interface HeaderProps {
    swipeCount?: number;
    minSwipes?: number;
    onShuffle?: () => void;
    showProgress?: boolean;
}

export default function Header({
    swipeCount = 0,
    minSwipes = 10,
    onShuffle,
    showProgress = false
}: HeaderProps) {
    const progress = Math.min(100, (swipeCount / minSwipes) * 100);
    const isReady = swipeCount >= minSwipes;

    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logo}>
                <span className={styles.logoIcon}>🍽️</span>
                <span className={styles.logoText}>Kunder Food</span>
            </Link>

            {showProgress && (
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                        <div
                            className={`${styles.progressFill} ${isReady ? styles.ready : ''}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className={styles.progressText}>
                        {isReady ? '✓ Ready for results!' : `${swipeCount}/${minSwipes}`}
                    </span>
                </div>
            )}

            <div className={styles.actions}>
                {onShuffle && (
                    <button className={styles.shuffleButton} onClick={onShuffle} title="Shuffle cards">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                        </svg>
                    </button>
                )}
                {isReady && (
                    <Link href="/results" className={styles.resultsButton}>
                        View Results
                    </Link>
                )}
            </div>
        </header>
    );
}
