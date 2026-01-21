import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroEmoji}>🍽️</span>
          <h1 className={styles.heroTitle}>
            Find Your Next
            <span className={styles.highlight}> Favorite Meal</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Swipe through delicious dishes, discover what you love, and get personalized meal recommendations.
          </p>
          <Link href="/swipe" className={styles.ctaButton}>
            Start Swiping
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepIcon}>👆</div>
            <h3>Swipe</h3>
            <p>Swipe right on dishes you like, left on ones you don&apos;t</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>⭐</div>
            <h3>Super Like</h3>
            <p>Swipe up on must-try dishes to mark them as favorites</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>🎯</div>
            <h3>Get Matches</h3>
            <p>Receive personalized recommendations based on your taste</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🌍</span>
          <div>
            <h4>Global Cuisines</h4>
            <p>Explore dishes from around the world</p>
          </div>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🧠</span>
          <div>
            <h4>Smart Matching</h4>
            <p>AI-powered recommendations just for you</p>
          </div>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>📱</span>
          <div>
            <h4>No Sign-up</h4>
            <p>Start swiping instantly, no account needed</p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Powered by <a href="https://www.themealdb.com" target="_blank" rel="noopener noreferrer">TheMealDB</a></p>
      </footer>
    </main>
  );
}
