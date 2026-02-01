import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import CountryCard from '../components/CountryCard';
import LoadingScreen from '../components/LoadingScreen';
import { Search, ChevronDown, Globe, ArrowUpDown, RefreshCw, ArrowUp } from 'lucide-react';

const Countries = () => {
    const location = useLocation();
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Initialize from location state if available, otherwise empty
    const [term, setTerm] = useState(location.state?.searchTerm || '');
    const [region, setRegion] = useState(location.state?.region || '');
    const [sort, setSort] = useState(localStorage.getItem('countries_sort') || 'alphabetical');
    const [wanderlist, setWanderlist] = useState([]);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setShowScrollTop(offset > 300);
            setIsScrolled(offset > 150);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const fetchCountries = async () => {
        setLoading(true);
        setError(null);
        try {
            // Using local API for reliability
            const res = await api.get('/countries');
            const sorted = res.data.sort((a, b) => a.name.common.localeCompare(b.name.common));
            setCountries(sorted);
        } catch (err) {
            console.error("Failed to fetch countries:", err);
            setError("Failed to load country data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCountries();
        if (token) {
            fetchWanderlist();
        }
    }, [token]);

    const fetchWanderlist = async () => {
        try {
            const res = await api.get('/wanderlist');
            setWanderlist(res.data);
        } catch (err) {
            console.error("Failed to fetch wanderlist:", err);
        }
    };

    const handleToggleWanderlist = async (country) => {
        if (!token) return alert('Please login to manage your wanderlist');

        const inList = wanderlist.find(item => item.name === country.name.common);

        try {
            if (inList) {
                const res = await api.delete(`/wanderlist/${inList.name}`);
                setWanderlist(res.data);
            } else {
                const res = await api.post('/wanderlist', {
                    name: country.name.common,
                    flag: country.flags.svg,
                    region: country.region
                });
                setWanderlist(res.data);
            }
        } catch (err) {
            console.error("Error toggling wanderlist:", err);
            alert('Error updating wanderlist');
        }
    };

    // Save only sort preference
    useEffect(() => {
        localStorage.setItem('countries_sort', sort);
    }, [sort]);

    // Handle Scroll Restoration
    useEffect(() => {
        if (!loading && countries.length > 0) {
            const savedScroll = localStorage.getItem('countries_scroll');
            if (savedScroll) {
                window.scrollTo(0, parseInt(savedScroll));
                // Clear after restoration to avoid unexpected jumps later
                localStorage.removeItem('countries_scroll');
            }
        }
    }, [loading, countries]);

    const handleCountryClick = () => {
        localStorage.setItem('countries_scroll', window.scrollY.toString());
    };

    const processedCountries = countries
        // 1. Filter
        .filter(country => {
            const matchesTerm = country.name.common.toLowerCase().includes(term.toLowerCase());
            const matchesRegion = region ? country.region === region : true;
            return matchesTerm && matchesRegion;
        })
        // 2. Sort
        .sort((a, b) => {
            if (sort === 'alphabetical') return a.name.common.localeCompare(b.name.common);
            if (sort === 'reverse') return b.name.common.localeCompare(a.name.common);
            if (sort === 'pop-high') return b.population - a.population;
            if (sort === 'pop-low') return a.population - b.population;
            if (sort === 'rating-high') return (b.averageRating || 0) - (a.averageRating || 0);
            return 0;
        });

    return (
        <div className="container" style={{ paddingTop: '140px', paddingBottom: '4rem', position: 'relative' }}>
            {/* Background Glows for Depth */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60vw',
                height: '400px',
                background: 'radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, rgba(15, 41, 30, 0) 70%)',
                zIndex: -1,
                pointerEvents: 'none'
            }}></div>
            <div className="animate-blob" style={{
                position: 'absolute',
                top: '50px',
                right: '10%',
                width: '250px',
                height: '250px',
                background: 'var(--secondary)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                opacity: 0.15,
                zIndex: -1,
                pointerEvents: 'none'
            }}></div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                marginBottom: '2rem',
                maxWidth: '800px',
                margin: '0 auto 2rem'
            }}>
                <h1 className="title text-gradient" style={{ fontSize: '4rem', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Explore the World</h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px', lineHeight: '1.7' }}>
                    Browse our extensive catalog of countries to find key facts, travel tips, and your next great adventure.
                </p>
            </div>

            {/* Sticky Search & Filter Bar */}
            <div style={{
                position: 'sticky',
                top: '80px',
                zIndex: 30,
                background: isScrolled ? 'rgba(15, 41, 30, 0.98)' : 'rgba(15, 41, 30, 0.2)', // Dynamic transparency
                backdropFilter: 'blur(12px)',
                padding: '1rem 2rem',
                borderRadius: '1rem',
                border: '1px solid var(--glass-border)',
                borderBottom: '1px solid var(--glass-border)',
                marginBottom: '5rem',
                marginLeft: '-1.5rem',
                marginRight: '-1.5rem',
                width: 'calc(100% + 3rem)',
                boxShadow: isScrolled ? '0 10px 40px -10px rgba(0,0,0,0.8)' : 'none', // Dynamic shadow
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                transition: 'all 0.3s ease'
            }}>
                {/* Search Input */}
                <div style={{ position: 'relative', flex: '1 1 400px', maxWidth: '800px' }}>
                    <Search size={20} color="var(--primary)" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search countries..."
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 3.5rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--glass-border)',
                            background: 'var(--bg-card)', // Matches cards
                            color: 'var(--text-main)',
                            transition: 'all 0.2s ease',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                {/* Region Filter */}
                <div style={{ position: 'relative', flex: '0 1 180px' }}>
                    <Globe size={18} color="var(--primary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        style={{
                            appearance: 'none',
                            width: '100%',
                            padding: '1rem 2.5rem 1rem 3rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--glass-border)',
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            height: '100%'
                        }}
                    >
                        <option value="">All Regions</option>
                        <option value="Africa">Africa</option>
                        <option value="Americas">Americas</option>
                        <option value="Asia">Asia</option>
                        <option value="Europe">Europe</option>
                        <option value="Oceania">Oceania</option>
                    </select>
                    <ChevronDown size={16} color="var(--primary)" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>

                {/* Sort Options */}
                <div style={{ position: 'relative', flex: '0 1 240px' }}>
                    <ArrowUpDown size={18} color="var(--primary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        style={{
                            appearance: 'none',
                            width: '100%',
                            padding: '1rem 2.5rem 1rem 3rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--glass-border)',
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            height: '100%'
                        }}
                    >
                        <option value="alphabetical">A to Z</option>
                        <option value="reverse">Z to A</option>
                        <option value="pop-high">Highest Population</option>
                        <option value="pop-low">Lowest Population</option>
                        <option value="rating-high">Highest Rating</option>
                    </select>
                    <ChevronDown size={16} color="var(--primary)" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
            </div>

            {loading ? (
                <LoadingScreen />
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: 'var(--secondary)', fontSize: '1.25rem', marginBottom: '1rem' }}>{error}</p>
                    <button onClick={fetchCountries} className="btn btn-primary">
                        <RefreshCw size={18} style={{ marginRight: '0.5rem' }} /> Retry
                    </button>
                </div>
            ) : processedCountries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>No countries found matching your criteria.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2.5rem'
                }}>
                    {processedCountries.map(country => (
                        <CountryCard
                            key={country.cca3}
                            country={country}
                            onClick={handleCountryClick}
                            isInWanderlist={wanderlist.some(w => w.name === country.name.common)}
                            onToggleWanderlist={handleToggleWanderlist}
                        />
                    ))}
                </div>
            )}

            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className={`btn-scroll-top ${showScrollTop ? 'visible' : ''}`}
                aria-label="Back to Top"
            >
                <ArrowUp size={24} />
            </button>
        </div >
    );
};

export default Countries;
