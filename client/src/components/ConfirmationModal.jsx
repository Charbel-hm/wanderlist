import React from 'react';
import { X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDangerous = false }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div
                className="glass-card"
                style={{
                    padding: '2rem',
                    maxWidth: '400px',
                    width: '90%',
                    textAlign: 'center',
                    position: 'relative',
                    animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'transparent', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>

                <h3 style={{ marginBottom: '1rem', color: 'white', fontSize: '1.5rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                        style={{ padding: '0.75rem 1.5rem', minWidth: '100px' }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className="btn"
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: isDangerous ? '#ef4444' : 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            minWidth: '100px'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default ConfirmationModal;
