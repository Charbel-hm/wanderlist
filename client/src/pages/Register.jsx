import { useState } from 'react';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // Still needed if we want to redirect to login

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Client-side Validation
        if (formData.password.length < 8) {
            setLoading(false);
            return setError('Password must be at least 8 characters long');
        }
        if (!/[a-zA-Z]/.test(formData.password) || !/\d/.test(formData.password)) {
            setLoading(false);
            return setError('Password must contain both letters and numbers');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setLoading(false);
            return setError('Invalid email format');
        }

        try {
            const res = await api.post('/auth/register', formData);
            setSuccessMsg(res.data.msg);
            // login(res.data.user, res.data.token); // Removed auto-login
            // navigate('/wanderlist');
        } catch (err) {
            console.error("Registration Error:", err);
            setError(err.response?.data?.msg || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (successMsg) {
        return (
            <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 1.5rem 2rem' }}>
                <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '3rem', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '1rem', color: '#4ade80' }}>Registration Successful!</h2>
                    <p style={{ marginBottom: '2rem', lineHeight: '1.6' }}>{successMsg}</p>
                    <Link to="/login" className="btn btn-primary" style={{ width: '100%', display: 'inline-block' }}>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 1.5rem 2rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '3rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Username</label>
                        <input
                            type="text"
                            required
                            className="glass-card"
                            style={{ width: '100%', padding: '0.75rem', color: 'var(--text-main)', background: 'rgba(255,255,255,0.05)' }}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                        <input
                            type="email"
                            required
                            className="glass-card"
                            style={{ width: '100%', padding: '0.75rem', color: 'var(--text-main)', background: 'rgba(255,255,255,0.05)' }}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            required
                            className="glass-card"
                            style={{ width: '100%', padding: '0.75rem', color: 'var(--text-main)', background: 'rgba(255,255,255,0.05)' }}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', opacity: loading ? 0.7 : 1 }} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
