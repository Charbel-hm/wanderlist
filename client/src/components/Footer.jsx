import { Globe } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{
            background: 'var(--bg-card)',
            padding: '4rem 0',
            marginTop: 'auto',
            borderTop: '1px solid var(--glass-border)'
        }}>
            <div className="container" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1.5rem'
                }}>
                    <img src="/logo.png" alt="Wanderlist Logo" style={{ height: '48px', width: '48px' }} />
                    <span style={{ fontSize: '1.75rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>Wanderlist</span>
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Explore • Save • Share
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                    <a href="#" style={{ color: 'var(--text-muted)' }}>Home</a>
                    <a href="#" style={{ color: 'var(--text-muted)' }}>Explore</a>
                    <a href="#" style={{ color: 'var(--text-muted)' }}>Wanderlist</a>
                    <a href="#" style={{ color: 'var(--text-muted)' }}>About</a>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    © 2025 Wanderlist. Built with passion for travel.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
