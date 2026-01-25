import { useState, useEffect } from 'react';
import api from '../utils/api';
import CountryCard from './CountryCard';
import { useNavigate } from 'react-router-dom';

const FeaturedSection = () => {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopCountries = async () => {
            try {
                const res = await api.get('/countries');
                // Sort by rating (desc) and take top 3
                const topRated = res.data
                    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
                    .slice(0, 3);
                setCountries(topRated);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching featured countries:', err);
                setLoading(false);
            }
        };

        fetchTopCountries();
    }, []);

    if (loading) return null; // Or a skeleton loader
    if (countries.length === 0) return null;

    return (
        <section style={{ padding: '6rem 0', background: 'transparent' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        Trending Destinations
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
                        The most highly-rated countries by our community of travelers.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {countries.map(country => (
                        <CountryCard
                            key={country.cca3}
                            country={country}
                            onClick={() => navigate(`/countries/${country.name.common}`)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedSection;
