import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Globe, Star, Bookmark, ChevronDown, Shuffle, MapPin, Trophy, Play } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import FeaturedSection from '../components/FeaturedSection';
import ExperienceCard from '../components/ExperienceCard';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';



const Home = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [countries, setCountries] = useState([]);
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [recentReviews, setRecentReviews] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const { user, loading: userLoading } = useAuth();

    const regions = [
        { name: 'Africa', value: 'Africa', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=600&q=80' },
        { name: 'America', value: 'Americas', img: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=600&q=80' },
        { name: 'Asia', value: 'Asia', img: 'https://images.unsplash.com/photo-1535139262971-c51845709a48?auto=format&fit=crop&w=600&q=80' },
        { name: 'Europe', value: 'Europe', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80' },
        { name: 'Oceania', value: 'Oceania', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [countriesRes, reviewsRes] = await Promise.all([
                    api.get('/countries'),
                    api.get('/reviews/recent')
                ]);

                if (countriesRes) setCountries(countriesRes.data);
                if (reviewsRes) setRecentReviews(reviewsRes.data);
            } catch (err) {
                console.error("Home: Failed to load content", err);
            }
        };
        fetchData();
    }, []);



    // Handle hash scrolling after content is likely ready
    useEffect(() => {
        if (window.location.hash) {
            const element = document.querySelector(window.location.hash);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 500); // Small delay to ensure render
            }
        }
    }, [countries, recentReviews]); // Re-run when content loads

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredCountries([]);
            setShowDropdown(false);
        } else {
            const matches = countries.filter(c =>
                c.name.common.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 5);
            setFilteredCountries(matches);
            setShowDropdown(true);
        }
    }, [searchTerm, countries]);

    const scrollToContent = () => {
        window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' });
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate('/countries', { state: { searchTerm } });
            setShowDropdown(false);
        }
    };

    const handleCountryClick = (countryName) => {
        navigate(`/countries/${countryName}`);
        setShowDropdown(false);
    };

    const handleSurpriseMe = async () => {
        try {
            const res = await api.get('/countries/random');
            if (res.data && res.data.name) {
                navigate(`/countries/${res.data.name.common}`);
            }
        } catch (err) {
            console.error("Failed to fetch random country", err);
        }
    };

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
            {/* GLOBAL BACKGROUND */}
            <div style={{
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.15) 0%, var(--bg-dark) 100%)',
                zIndex: -2,
                pointerEvents: 'none'
            }}></div>

            {/* Animated Orbs - Global */}
            <div className="animate-blob" style={{
                position: 'fixed',
                top: '20%',
                left: '15%',
                width: '350px',
                height: '350px',
                background: 'var(--primary)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                opacity: 0.25,
                zIndex: -1,
                animationDelay: '0s',
                pointerEvents: 'none'
            }}></div>
            <div className="animate-blob" style={{
                position: 'fixed',
                top: '40%',
                right: '25%',
                width: '300px',
                height: '300px',
                background: '#ec4899',
                borderRadius: '50%',
                filter: 'blur(80px)',
                opacity: 0.25,
                zIndex: -1,
                animationDelay: '4s',
                pointerEvents: 'none'
            }}></div>
            <div className="animate-blob" style={{
                position: 'fixed',
                bottom: '15%',
                right: '10%',
                width: '300px',
                height: '300px',
                background: 'var(--secondary)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                opacity: 0.25,
                zIndex: -1,
                animationDelay: '2s',
                pointerEvents: 'none'
            }}></div>

            {/* Hero Section */}
            <section style={{
                position: 'relative',
                height: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                // removed overflow:hidden to let background shine through nicely if needed, 
                // but kept if layout breaks. Actually, for a section, it's fine.
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h1 className="title animate-fade-in delay-100" style={{
                        fontSize: 'clamp(3rem, 6vw, 5rem)',
                        marginBottom: '1.5rem',
                        letterSpacing: '-2px',
                        lineHeight: 1.1
                    }}>
                        Wanderlist... Your World, <br />
                        <span className="text-gradient">One Country at a Time</span>
                    </h1>

                    <p className="animate-fade-in delay-200" style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-muted)',
                        maxWidth: '600px',
                        margin: '0 auto 2.5rem'
                    }}>
                        Discover countries, save your dream destinations, and share real travel experiences from people around the world.
                    </p>

                    <div className="animate-fade-in delay-300" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>

                        {/* Search Bar & Autocomplete */}
                        <div style={{ position: 'relative', width: '100%', maxWidth: '500px', zIndex: 50 }}>
                            <input
                                type="text"
                                placeholder="Where do you want to go?"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                onFocus={() => searchTerm && setShowDropdown(true)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.5rem',
                                    borderRadius: '9999px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    color: 'var(--text-main)',
                                    fontSize: '1.1rem',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.2), 0 0 15px rgba(16, 185, 129, 0.1)',
                                    paddingRight: '3.5rem'
                                }}
                            />
                            <button
                                onClick={handleSearch}
                                style={{
                                    position: 'absolute',
                                    right: '0.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'transform 0.2s ease'
                                }}
                            >
                                <ArrowRight size={20} />
                            </button>

                            {/* Autocomplete Dropdown */}
                            {showDropdown && filteredCountries.length > 0 && (
                                <div className="glass-card" style={{
                                    position: 'absolute',
                                    top: '120%',
                                    left: 0,
                                    width: '100%',
                                    borderRadius: '1rem',
                                    padding: '0.5rem',
                                    textAlign: 'left',
                                    zIndex: 100,
                                    overflow: 'hidden'
                                }}>
                                    {filteredCountries.map(country => (
                                        <div
                                            key={country.cca3}
                                            onMouseDown={() => handleCountryClick(country.name.common)}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                cursor: 'pointer',
                                                borderRadius: '0.5rem',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <img src={country.flags.svg} alt="" style={{ width: '24px', height: '16px', objectFit: 'cover', borderRadius: '2px' }} />
                                            <span>{country.name.common}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/countries" className="btn btn-secondary">
                                Explore All Countries
                            </Link>
                            <button onClick={handleSurpriseMe} className="btn btn-secondary" style={{ borderColor: 'var(--secondary)', color: 'var(--secondary)' }}>
                                <Shuffle size={18} style={{ marginRight: '0.5rem' }} />
                                Surprise Me
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div onClick={scrollToContent} className="animate-float delay-500" style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    opacity: 0.7
                }}>
                    <ChevronDown size={32} />
                </div>
            </section>

            {/* Region Explorer */}
            <section style={{ padding: '4rem 0' }}>
                <div className="container">
                    <h2 className="title" style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Browse by Region</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {regions.map(region => (
                            <div
                                key={region.name}
                                onClick={() => {
                                    navigate('/countries', { state: { region: region.value } });
                                }}
                                className="glass-card"
                                style={{
                                    height: '150px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    backgroundImage: `url(${region.img})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    filter: 'brightness(0.6)',
                                    transition: 'transform 0.3s ease'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                                <h3 style={{ position: 'relative', zIndex: 1, fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                    {region.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Section (Trending) */}
            <FeaturedSection />

            {/* Community/Recent Reviews */}
            {recentReviews.length > 0 && (
                <section style={{ padding: '6rem 0' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                                Community Voices
                            </h2>
                            <p style={{ color: 'var(--text-muted)' }}>Latest travel experiences shared by explorers.</p>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '2rem'
                        }}>
                            {recentReviews.map(review => (
                                <div key={review._id} onClick={() => navigate(`/countries/${review.countryName}`)} style={{ cursor: 'pointer' }}>
                                    <ExperienceCard review={review} />
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)', textAlign: 'right' }}>
                                        — in {review.countryName}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section id="game-section" style={{ padding: '6rem 0', background: 'rgba(0,0,0,0.2)' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'var(--secondary)', color: 'black', fontWeight: 'bold', borderRadius: '2rem', marginBottom: '1.5rem' }}>
                            NEW MINIGAME
                        </div>
                        <h2 className="title" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
                            60 Seconds. Go!
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.8' }}>
                            Test your reflexes and geography skills. Identify as many flags as you can in one minute. No pauses, just action.
                        </p>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <Link to="/game" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                                <Play size={20} style={{ marginRight: '0.5rem' }} /> Play Now
                            </Link>
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--primary)', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.3 }}></div>
                        <Trophy size={64} color="gold" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Best Score</h3>
                        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
                            {/* High Score Logic */}
                            {userLoading ? (
                                <span style={{ fontSize: '2rem' }}>...</span>
                            ) : user ? (
                                user.flagGameHighScore || 0
                            ) : '?'}
                        </div>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {userLoading ? 'Loading score...' : (user ? 'Flags in 1 min' : 'Log in to save your score!')}
                        </p>
                    </div>
                </div>
            </section>

            <section style={{ padding: '6rem 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                            Why Wanderlist?
                        </h2>
                        <p style={{ color: 'var(--text-muted)' }}>Built using modern web technologies.</p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem',
                        textAlign: 'center'
                    }}>
                        <div className="glass-card animate-fade-in delay-500" style={{ padding: '3rem 2rem' }}>
                            <div style={{
                                display: 'inline-flex',
                                padding: '1rem',
                                borderRadius: '50%',
                                background: 'rgba(16, 185, 129, 0.1)',
                                marginBottom: '1.5rem',
                                color: 'var(--primary)'
                            }}>
                                <Globe size={40} />
                            </div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Discover</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Browse countries with real traveler insights and key facts.</p>
                        </div>

                        <div className="glass-card animate-fade-in delay-500" style={{ padding: '3rem 2rem' }}>
                            <div style={{
                                display: 'inline-flex',
                                padding: '1rem',
                                borderRadius: '50%',
                                background: 'rgba(251, 191, 36, 0.1)',
                                marginBottom: '1.5rem',
                                color: 'var(--secondary)'
                            }}>
                                <Star size={40} />
                            </div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Rate & Review</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Share your honest experiences to help others travel better.</p>
                        </div>

                        <div className="glass-card animate-fade-in delay-500" style={{ padding: '3rem 2rem' }}>
                            <div style={{
                                display: 'inline-flex',
                                padding: '1rem',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.05)',
                                marginBottom: '1.5rem',
                                color: 'var(--text-main)'
                            }}>
                                <Bookmark size={40} />
                            </div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Save</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Build your personal travel bucket list in seconds.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div >
    );
};

export default Home;
