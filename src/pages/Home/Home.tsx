import { 
    Target, Trophy, Flame, Zap, Award, 
    Play, Rocket, ArrowRight, ShieldCheck, 
    Box, Timer, Sparkles
} from "lucide-react";
import "./styles/Home.css";

export default function Home() {
    // Helper function for navigating - in a real app this would use React Router
    const navigateTo = (path: string) => {
        // Since we are using simple state-based routing in App.tsx without a router library,
        // we can trigger custom events or rely on the navbar state. 
        // For now, this is a placeholder or we can just scroll to top if it's external.
        console.log("Navigating to", path);
    };

    return (
        <main className="landing-container container">
            
            {/* 1. Hero Section */}
            <section className="hero-section landing-section">
                <div className="hero-content">
                    <div className="banner-badge">
                        <Trophy size={64} className="badge-icon" />
                    </div>
                    <h1 className="hero-title">Welcome to Palovsky</h1>
                    <p className="hero-subtitle">
                        Level up your coding and cubing skills. Complete daily missions, 
                        track your speedcubing sessions, and earn gems as you progress through 
                        our interactive gamified ecosystem.
                    </p>
                    <div className="hero-cta">
                        <button className="btn-primary" onClick={() => navigateTo('Timer')}>
                            <Play size={20} />
                            Start Cubing
                        </button>
                        <button className="btn-secondary" onClick={() => navigateTo('Community')}>
                            <Rocket size={20} />
                            Explore Community
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. About Palovsky (Features) */}
            <section className="features-section landing-section">
                <div className="section-header">
                    <h2 className="section-title">The Gamified Workspace</h2>
                    <p className="section-subtitle">
                        Palovsky turns your daily routines into rewarding missions. 
                        Earn experience points (XP) and unlock new ranks.
                    </p>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Target size={32} />
                        </div>
                        <h3 className="feature-card-title">Daily Missions</h3>
                        <p className="feature-card-desc">
                            Complete daily tasks to maintain your streak and earn bonus XP. 
                            Missions reset every 24 hours.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Sparkles size={32} />
                        </div>
                        <h3 className="feature-card-title">Earn Rewards</h3>
                        <p className="feature-card-desc">
                            Gain gems and unlock exclusive badges. Show off your achievements 
                            on the community leaderboard.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="feature-card-title">Rank Up</h3>
                        <p className="feature-card-desc">
                            Start as a Tech Novice and level up to Grandmaster. 
                            Your progression is tracked permanently.
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. Rubik's Cube Integration */}
            <section className="rubik-section landing-section">
                <div className="section-header">
                    <h2 className="section-title">Master the Cube</h2>
                    <p className="section-subtitle">
                        Built-in tools for speedcubers. Generate scrambles, time your solves, 
                        and analyze your performance.
                    </p>
                </div>
                <div className="rubik-integration">
                    <div className="rubik-content">
                        <h3 className="feature-card-title">Advanced Speedcubing Timer</h3>
                        <p className="feature-card-desc" style={{marginBottom: "1rem"}}>
                            Our spacebar-driven timer integrates seamlessly with the Palovsky 
                            dashboard, offering WCA-compliant scrambles and inspection times.
                        </p>
                        <ul className="rubik-features-list">
                            <li className="rubik-list-item">
                                <Box className="rubik-check" size={20} />
                                <span>2D Net Scramble Visualizer</span>
                            </li>
                            <li className="rubik-list-item">
                                <Timer className="rubik-check" size={20} />
                                <span>15-second WCA Inspection</span>
                            </li>
                            <li className="rubik-list-item">
                                <Award className="rubik-check" size={20} />
                                <span>Detailed session statistics (Ao5, Ao12)</span>
                            </li>
                        </ul>
                        <button className="btn-secondary" style={{width: "fit-content", marginTop: "1rem"}} onClick={() => navigateTo('Timer')}>
                            Try the Timer <ArrowRight size={16} />
                        </button>
                    </div>
                    <div className="rubik-visual">
                        <div className="rubik-placeholder">
                            3D CUBE SIMULATOR
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Progression & Stats (Existing Dashboard Cards) */}
            <section className="stats-section landing-section">
                <div className="section-header">
                    <h2 className="section-title">Your Command Center</h2>
                    <p className="section-subtitle">
                        Track your live progression and active missions.
                    </p>
                </div>
                <div className="dashboard-grid">
                    {/* Mission Card */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <Target className="card-icon text-primary" size={24} />
                            <h2 className="card-title">Active Missions</h2>
                        </div>
                        <ul className="mission-list">
                            <li className="mission-item completed">
                                <input type="checkbox" checked readOnly />
                                <span>Initialize Palovsky project space</span>
                                <span className="mission-xp">+50 XP</span>
                            </li>
                            <li className="mission-item">
                                <input type="checkbox" readOnly />
                                <span>Integrate JetBrains Mono typography</span>
                                <span className="mission-xp">+100 XP</span>
                            </li>
                            <li className="mission-item">
                                <input type="checkbox" readOnly />
                                <span>Solve 5 Rubik's cubes</span>
                                <span className="mission-xp">+150 XP</span>
                            </li>
                        </ul>
                    </div>

                    {/* Stats Card */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <Zap className="card-icon text-secondary" size={24} />
                            <h2 className="card-title">Level Progression</h2>
                        </div>
                        <div className="progress-section">
                            <div className="progress-info">
                                <span>LEVEL 12 (Tech Novice)</span>
                                <span>850 / 1000 XP</span>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: "85%" }}></div>
                            </div>
                        </div>
                        <div className="achievements-mini" style={{marginTop: "1.5rem"}}>
                            <span style={{fontSize: "0.875rem", color: "var(--foreground-muted)", display: "flex", alignItems: "center", marginRight: "1rem"}}>Latest Badges:</span>
                            <div className="mini-badge" title="7-Day Streak">
                                <Flame size={20} />
                            </div>
                            <div className="mini-badge" title="Supportive heart">
                                <Award size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. CTA Section */}
            <section className="cta-section landing-section">
                <Trophy size={48} color="var(--primary)" style={{animation: "pulse 2s infinite alternate ease-in-out"}} />
                <h2 className="cta-title">Ready to Rank Up?</h2>
                <p className="cta-desc">
                    Join Palovsky today. Complete your first mission, solve a WCA scramble, 
                    and climb the global leaderboard.
                </p>
                <button className="btn-primary" onClick={() => navigateTo('Home')}>
                    <Zap size={20} />
                    Accept the Challenge
                </button>
            </section>

        </main>
    );
}
