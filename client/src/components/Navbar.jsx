import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, User, LogOut, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--glass-border)'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.2rem 2rem',
                maxWidth: '1400px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-secondary"
                        style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--glass-border)',
                            opacity: location.pathname === '/' ? 0 : 1,
                            pointerEvents: location.pathname === '/' ? 'none' : 'auto',
                            transition: 'opacity 0.2s ease'
                        }}
                        title="Go Back"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <Link to="/" style={{
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--text-main)', // Explicitly use text-main
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        letterSpacing: '1px'
                    }}>
                        <img src="/logo.png" alt="Wanderlist Logo" style={{ height: '48px', width: '48px' }} />
                        Wanderlist
                    </Link>
                </div>

                <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', fontSize: '1.1rem' }}>
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/countries" className="nav-link">Explore</Link>
                    {isAuthenticated && <Link to="/wanderlist" className="nav-link">Wanderlist</Link>}
                    <Link to="/about" className="nav-link">About</Link>

                    {isAuthenticated ? (
                        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'var(--primary)', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '1rem',
                                overflow: 'hidden', border: '2px solid var(--glass-border)'
                            }}>
                                {user?.profilePicture ? (
                                    <img src={`http://localhost:5000${user.profilePicture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    user?.username?.charAt(0).toUpperCase()
                                )}
                            </div>
                        </Link>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '1rem' }}>
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
