import React from 'react';

const LoadingScreen = ({ onDismiss }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'var(--bg-dark)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            transition: 'opacity 0.5s ease'
        }}>
            <div style={{ position: 'relative' }}>
                {/* Glowing/Pulsing effect behind logo */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120px',
                    height: '120px',
                    background: 'var(--primary)',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                    opacity: 0.5,
                    animation: 'pulse-glow 2s infinite'
                }}></div>

                <img
                    src="/logo.png"
                    alt="Loading..."
                    style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'contain',
                        position: 'relative',
                        zIndex: 2,
                        animation: 'float 3s ease-in-out infinite'
                    }}
                />
            </div>

            <h2 className="text-gradient" style={{
                marginTop: '2rem',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem',
                letterSpacing: '2px',
                animation: 'fadeIn 1s ease-out'
            }}>
            </h2>

            <button
                onClick={onDismiss}
                style={{
                    marginTop: '2rem',
                    background: 'transparent',
                    border: '1px solid var(--text-muted)',
                    color: 'var(--text-muted)',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    zIndex: 10000,
                    pointerEvents: 'auto'
                }}
            >
                Dismiss (Stuck?)
            </button>
        </div>
    );
};

export default LoadingScreen;
