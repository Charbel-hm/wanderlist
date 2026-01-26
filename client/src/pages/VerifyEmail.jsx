import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [msg, setMsg] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMsg('No token provided');
            return;
        }

        const verify = async () => {
            try {
                const res = await api.get(`/auth/verify/${token}`);

                // If backend returns token, auto-login
                if (res.data.token && res.data.user) {
                    login(res.data.user, res.data.token);
                    setStatus('success');
                    setMsg('Verified! Redirecting to your dashboard...');

                    // Delay slightly for UX so user sees "Verified"
                    setTimeout(() => {
                        navigate('/wanderlist');
                    }, 2000);
                } else {
                    // Fallback for old backend behavior
                    setStatus('success_manual');
                    setMsg(res.data.msg);
                }

            } catch (err) {
                setStatus('error');
                setMsg(err.response?.data?.msg || 'Verification failed');
            }
        };

        verify();
    }, [token, login, navigate]);

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px' }}>
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', maxWidth: '500px', width: '100%' }}>
                {status === 'verifying' && (
                    <>
                        <h2>Verifying...</h2>
                        <p>Please wait while we verify your email.</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <h2 style={{ color: '#4ade80', marginBottom: '1rem' }}>Success! 🚀</h2>
                        <p style={{ marginBottom: '2rem' }}>{msg}</p>
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                    </>
                )}
                {status === 'success_manual' && ( // Fallback UI
                    <>
                        <h2 style={{ color: '#4ade80', marginBottom: '1rem' }}>Verified!</h2>
                        <p style={{ marginBottom: '2rem' }}>{msg}</p>
                        <Link to="/login" className="btn btn-primary">Login Now</Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <h2 style={{ color: '#f87171', marginBottom: '1rem' }}>Verification Failed</h2>
                        <p style={{ marginBottom: '2rem' }}>{msg}</p>
                        <Link to="/register" className="btn btn-secondary">Register Again</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
