import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Trophy, Clock, X, Home, Play, RotateCcw } from 'lucide-react';
import { OFFICIAL_COUNTRIES } from '../utils/sovereignCountries';

const FlagGame = () => {
    const navigate = useNavigate();
    const [countries, setCountries] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'finished'
    const [loading, setLoading] = useState(true);
    const [highScore, setHighScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [user, setUser] = useState(null);
    const [isImageLoading, setIsImageLoading] = useState(true);

    const timerRef = useRef(null);

    // Fetch initial data
    useEffect(() => {
        const init = async () => {
            try {
                const [userData, countriesData] = await Promise.all([
                    api.get('/auth/me').catch(() => ({ data: null })),
                    api.get('/countries')
                ]);

                if (userData.data) {
                    setUser(userData.data);
                    setHighScore(userData.data.flagGameHighScore || 0);
                }

                // Filter for official countries only
                const allCountries = countriesData.data;
                const officialCountries = allCountries.filter(c => OFFICIAL_COUNTRIES.includes(c.cca3));
                setCountries(officialCountries.length > 0 ? officialCountries : allCountries);
                setLoading(false);
            } catch (err) {
                console.error("Game init failed", err);
                setLoading(false);
            }
        };
        init();
    }, []);

    // Timer Logic
    useEffect(() => {
        if (gameState !== 'playing') return;
        if (isImageLoading) return; // Pause timer if image is loading

        if (timeLeft > 0) {
            timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        } else {
            endGame();
        }

        return () => clearTimeout(timerRef.current);
    }, [timeLeft, gameState, isImageLoading]);

    const startGame = () => {
        setScore(0);
        setCurrentQuestion(0);
        setGameState('playing');
        setTimeLeft(60);
        setIsImageLoading(true);
        generateQuestions();
    };

    const generateQuestions = () => {
        if (countries.length === 0) return;

        // Endless mode: Shuffle ALL countries
        // If user is godlike and does > 190 in 60s, we might need to loop, but unlikely.
        // Let's just shuffle once.
        const shuffled = [...countries].sort(() => 0.5 - Math.random());
        const newQuestions = [];

        for (let i = 0; i < shuffled.length; i++) {
            const correct = shuffled[i];
            const distractors = shuffled
                .filter(c => c.cca3 !== correct.cca3)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            const options = [correct, ...distractors].sort(() => 0.5 - Math.random());

            newQuestions.push({
                correct,
                options
            });
        }
        setQuestions(newQuestions);
    };

    const handleAnswer = (selectedIso) => {
        const isCorrect = selectedIso === questions[currentQuestion]?.correct?.cca3;

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        // Always move next, instant feedback could be added here (e.g. green/red flash)
        // For speed, we just go next instantly.
        if (currentQuestion + 1 < questions.length) {
            setIsImageLoading(true); // Reset loading for next image
            setCurrentQuestion(prev => prev + 1);
        } else {
            // Looped all countries? End game
            endGame();
        }
    };

    const endGame = async () => {
        setGameState('finished');

        // Optimistic update for UI
        if (score > highScore) {
            setHighScore(score);
        }

        if (user) {
            // We use current score state, but careful about closure staleness?
            // Actually 'score' here might be stale if called from useEffect closure.
            // Better to pass finalScore or use ref. 
            // However, endGame is called from timer (useEffect) or handleAnswer.
            // If called from timer, score is fresh due to [timeLeft] dep? No.
            // Let's ensure we use the explicit value.
        }
    };

    // Need a separate effect to save score when game finishes to avoid closure issues
    useEffect(() => {
        const saveScore = async () => {
            if (gameState === 'finished' && user) {
                if (score > (user.flagGameHighScore || 0)) {
                    try {
                        await api.post('/game/score', { score: score });
                        // Update local user object to prevent refetch need
                        user.flagGameHighScore = score;
                    } catch (err) {
                        console.error("Failed to save score");
                    }
                }
            }
        };
        saveScore();
    }, [gameState, score, user]);


    if (loading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div style={{ paddingTop: '100px', paddingBottom: '4rem', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
            <div style={{
                position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                background: 'radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.15) 0%, var(--bg-dark) 100%)',
                zIndex: -2, pointerEvents: 'none'
            }}></div>

            <div className="container" style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>

                {/* MENU SCREEN */}
                {gameState === 'menu' && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', position: 'relative' }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                position: 'absolute', top: '1.5rem', right: '1.5rem',
                                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                                width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s'
                            }}
                        >
                            <X size={24} />
                        </button>

                        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Time Attack
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
                            60 Seconds. Infinite Flags. <br /> How many can you identify?
                        </p>

                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>YOUR BEST SCORE</div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white' }}>{highScore}</div>
                        </div>

                        <button onClick={startGame} className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.25rem' }}>
                            <Play size={24} style={{ marginRight: '0.75rem' }} /> Start Game
                        </button>
                    </div>
                )}

                {/* GAME SCREEN */}
                {gameState === 'playing' && (
                    <div className="glass-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ textAlign: 'left' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Score</span>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>{score}</div>
                            </div>

                            <div style={{
                                background: timeLeft <= 10 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)',
                                padding: '0.5rem 1.5rem', borderRadius: '2rem',
                                border: timeLeft <= 10 ? '1px solid #ef4444' : '1px solid var(--glass-border)',
                                display: 'flex', alignItems: 'center', gap: '0.75rem'
                            }}>
                                <Clock size={24} color={timeLeft <= 10 ? '#ef4444' : 'white'} />
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: timeLeft <= 10 ? '#ef4444' : 'white' }}>
                                    {timeLeft}s
                                </span>
                            </div>

                            <button onClick={() => setGameState('menu')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '3rem', minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {questions[currentQuestion] ? (
                                <>
                                    {isImageLoading && <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>}
                                    <img
                                        src={questions[currentQuestion].correct.flags.svg}
                                        alt="Flag"
                                        onLoad={() => setIsImageLoading(false)}
                                        style={{
                                            display: isImageLoading ? 'none' : 'block',
                                            height: '240px', borderRadius: '1rem',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', maxWidth: '100%', objectFit: 'contain'
                                        }}
                                    />
                                </>
                            ) : <div>Loading...</div>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {questions[currentQuestion]?.options.map(opt => (
                                <button
                                    key={opt.cca3}
                                    onClick={() => handleAnswer(opt.cca3)}
                                    className="btn"
                                    style={{
                                        justifyContent: 'center', padding: '1.5rem', fontSize: '1.1rem',
                                        background: 'rgba(255, 255, 255, 0.1)', color: 'white',
                                        border: '1px solid var(--glass-border)', textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                >
                                    {opt.name.common}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* GAME OVER SCREEN */}
                {gameState === 'finished' && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Time's Up!</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You identified</p>

                        <div style={{
                            fontSize: '6rem', fontWeight: 'bold', color: 'var(--primary)',
                            textShadow: '0 0 30px var(--primary-glow)', marginBottom: '1rem', lineHeight: 1
                        }}>
                            {score}
                        </div>
                        <div style={{ fontSize: '1.25rem', color: 'white', marginBottom: '3rem' }}>Flags</div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={startGame} className="btn btn-secondary">
                                <RotateCcw size={20} style={{ marginRight: '0.5rem' }} /> Play Again
                            </button>
                            <button onClick={() => window.location.href = '/#game-section'} className="btn btn-primary">
                                <Home size={20} style={{ marginRight: '0.5rem' }} /> Back to Home
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default FlagGame;
