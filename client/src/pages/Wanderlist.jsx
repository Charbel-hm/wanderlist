import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, X, Check } from 'lucide-react';

const Wanderlist = () => {
    const [countries, setCountries] = useState([]);
    const [visitedCountries, setVisitedCountries] = useState([]);
    const [loading, setLoading] = useState(true);

    const [visitedCount, setVisitedCount] = useState(0);

    useEffect(() => {
        const fetchWanderlist = async () => {
            try {
                setLoading(true);
                const [wanderlistRes, userRes, visitedDetailsRes] = await Promise.all([
                    api.get('/wanderlist'),
                    api.get('/auth/me'),
                    api.get('/users/visited-details')
                ]);

                // userRes logic
                const visitedNames = userRes.data?.visitedCountries || [];
                setVisitedCountries(visitedNames);
                setVisitedCount(visitedNames.length);

                // Merge lists
                const saved = wanderlistRes.data.map(c => ({ ...c, isSaved: true }));
                const visited = visitedDetailsRes.data.map(c => ({
                    name: c.name.common,
                    flag: c.flags.svg,
                    region: c.region,
                    isVisited: true
                }));

                const combinedMap = new Map();

                // Add all saved first
                saved.forEach(c => {
                    combinedMap.set(c.name, { ...c, isSaved: true, isVisited: visitedNames.includes(c.name) });
                });

                // Add visited if not already present
                visited.forEach(c => {
                    if (combinedMap.has(c.name)) {
                        combinedMap.get(c.name).isVisited = true;
                    } else {
                        combinedMap.set(c.name, { ...c, isSaved: false, isVisited: true });
                    }
                });

                setCountries(Array.from(combinedMap.values()));

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchWanderlist();
    }, []);

    const handleRemove = async (e, countryName) => {
        e.preventDefault();
        try {
            await api.delete(`/wanderlist/${countryName}`);
            setCountries(prev => prev.filter(c => c.name !== countryName));
        } catch (err) {
            console.error("Failed to remove from wanderlist", err);
        }
    };

    const toggleVisited = async (e, countryName) => {
        e.preventDefault();
        try {
            if (visitedCountries.includes(countryName)) {
                await api.delete(`/users/visited/${countryName}`);
                setVisitedCountries(prev => prev.filter(c => c !== countryName));
                setVisitedCount(prev => prev - 1);
            } else {
                await api.post('/users/visited', { countryName });
                setVisitedCountries(prev => [...prev, countryName]);
                setVisitedCount(prev => prev + 1);
            }
        } catch (err) {
            console.error("Failed to toggle visited status", err);
        }
    };


    if (loading) return <div className="container" style={{ paddingTop: '100px' }}>Loading...</div>;

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>My Wanderlist</h1>
                <p style={{ color: 'var(--text-muted)' }}>Countries you dream of visiting — all in one place.</p>

                {/* Stats */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
                    <div className="glass-card" style={{ padding: '1rem 2rem', minWidth: '150px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{countries.length}</span>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Countries Saved</p>
                    </div>
                    <div className="glass-card" style={{ padding: '1rem 2rem', minWidth: '150px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            {visitedCount}
                        </span>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Countries Visited</p>
                    </div>
                </div>
            </div>

            {countries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Your Wanderlist is empty.</p>
                    <Link to="/countries" className="btn btn-primary">Explore Countries</Link>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {countries.map(country => (
                        <Link
                            key={country.name}
                            to={`/countries/${country.name}`}
                            className="glass-card"
                            style={{
                                padding: 0,
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'block',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4), 0 0 20px var(--primary-glow)';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                            }}
                        >
                            <div style={{ height: '180px', overflow: 'hidden' }}>
                                <img
                                    src={country.flag}
                                    alt={country.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.5s ease'
                                    }}
                                    className="card-image"
                                />
                            </div>
                            {country.isSaved && (

                                <button
                                    onClick={(e) => handleRemove(e, country.name)}
                                    style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        background: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backdropFilter: 'blur(4px)',
                                        zIndex: 10,
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--secondary)';
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            )
                            }

                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{country.name}</h3>
                                    <button
                                        onClick={(e) => toggleVisited(e, country.name)}
                                        style={{
                                            background: visitedCountries.includes(country.name) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                            color: visitedCountries.includes(country.name) ? '#34d399' : 'var(--text-muted)',
                                            border: `1px solid ${visitedCountries.includes(country.name) ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            zIndex: 2, // Ensure it's clickable above the link
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!visitedCountries.includes(country.name)) {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                                e.currentTarget.style.color = 'white';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!visitedCountries.includes(country.name)) {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                e.currentTarget.style.color = 'var(--text-muted)';
                                            }
                                        }}
                                    >
                                        <Check size={12} style={{ opacity: visitedCountries.includes(country.name) ? 1 : 0.5 }} />
                                        {visitedCountries.includes(country.name) ? 'Visited' : 'Mark Visited'}
                                    </button>

                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <MapPin size={14} color="var(--primary)" />
                                    {country.region}
                                </div>
                            </div>
                        </Link>
                    ))
                    }
                </div >
            )}
        </div >
    );
};

export default Wanderlist;
