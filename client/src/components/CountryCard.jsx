import { MapPin, Users, Star, Plus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPopulation } from '../utils/formatters';

const CountryCard = ({ country, onClick, isInWanderlist, onToggleWanderlist }) => {
    return (
        <Link to={`/countries/${country.name.common}`} onClick={onClick} className="glass-card" style={{
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            height: '100%',
            overflow: 'hidden',
            padding: 0
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
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleWanderlist && onToggleWanderlist(country);
                }}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.4)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title={isInWanderlist ? "Remove from Wanderlist" : "Add to Wanderlist"}
            >
                {isInWanderlist ? (
                    <Check size={18} color="var(--primary)" strokeWidth={3} />
                ) : (
                    <Plus size={18} color="var(--text-main)" strokeWidth={3} />
                )}
            </button>

            <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                <img
                    src={country.flags.svg}
                    alt={`${country.name.common} flag`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
            <div style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{country.name.common}</h3>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} color="var(--primary)" />
                        {country.region}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users size={14} color="var(--secondary)" />
                        {formatPopulation(country.population)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
                        <Star size={14} fill={country.averageRating > 0 ? "gold" : "none"} color={country.averageRating > 0 ? "gold" : "var(--text-muted)"} />
                        <span style={{ fontWeight: '500', color: country.averageRating > 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                            {country.averageRating > 0 ? country.averageRating.toFixed(1) : '—'}
                        </span>
                    </div>
                </div>
            </div>
        </Link >
    );
};

export default CountryCard;
