import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, User, LogOut, ArrowLeft, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Explore', path: '/countries' },
        ...(isAuthenticated ? [{ name: 'Wanderlist', path: '/wanderlist' }] : []),
        { name: 'About', path: '/about' },
    ];

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            zIndex: 1000,
            background: isScrolled || isMenuOpen ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--glass-border)',
            transition: 'all 0.3s ease'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                height: '80px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {location.pathname !== '/' && (
                        <button
                            onClick={() => navigate(-1)}
                            className="btn-secondary"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--glass-border)'
                            }}
                            title="Go Back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <Link to="/" style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        letterSpacing: '0.5px'
                    }}>
                        <img src="/logo.png" alt="Wanderlist Logo" style={{ height: '36px', width: '36px' }} />
                        <span style={{ display: 'block' }}>Wanderlist</span>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {navLinks.map((link) => (
                        <Link key={link.path} to={link.path} className="nav-link" style={{ fontSize: '1rem' }}>
                            {link.name}
                        </Link>
                    ))}

                    {isAuthenticated ? (
                        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: 'var(--primary)', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '0.9rem',
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
                        <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={toggleMenu}
                    style={{ color: 'var(--text-main)', display: 'none' }}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`} style={{
                position: 'fixed',
                top: '80px',
                left: 0,
                width: '100%',
                height: 'calc(100vh - 80px)',
                background: 'rgba(15, 23, 42, 0.98)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem',
                gap: '1.5rem',
                transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s ease-in-out',
                overflowY: 'auto'
            }}>
                {navLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className="nav-link"
                        style={{ fontSize: '1.25rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        {link.name}
                    </Link>
                ))}

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {isAuthenticated ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link to="/profile" className="nav-link" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'var(--primary)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '0.8rem',
                                    overflow: 'hidden'
                                }}>
                                    {user?.profilePicture ? (
                                        <img src={`http://localhost:5000${user.profilePicture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        user?.username?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                My Profile
                            </Link>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                            Login
                        </Link>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-menu {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: block !important;
                    }
                }
                @media (min-width: 769px) {
                    .mobile-menu {
                        display: none !important;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
