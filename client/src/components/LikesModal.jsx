import { useEffect } from 'react';
import { X } from 'lucide-react';
import { getMediaUrl } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

const LikesModal = ({ isOpen, onClose, likedBy }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 41, 30, 0.4)', // Lighter, tinted with theme green
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(16px)', // Strong wash
            overscrollBehavior: 'contain'
        }}
            onClick={onClose}
        >
            <div
                className="glass-card"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '1.5rem',
                    margin: '1rem',
                    // Removed overflowY: auto from here so header stays fixed
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '85vh' // Constraint the card height
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
                    <h3 style={{ margin: 0 }}>Liked By</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    overflowY: 'auto', // Scroll ONLY the list
                    paddingRight: '0.5rem', // Space for scrollbar
                    scrollbarWidth: 'thin'
                }}>
                    {likedBy && likedBy.length > 0 ? (
                        likedBy.map(user => (
                            <div
                                key={user._id}
                                style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                                onClick={() => {
                                    onClose();
                                    navigate(`/profile/${user.username}`);
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    background: 'var(--primary)',
                                    flexShrink: 0
                                }}>
                                    {user.profilePicture ? (
                                        <img
                                            src={getMediaUrl(user.profilePicture)}
                                            alt={user.username}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            color: 'white'
                                        }}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p style={{ fontWeight: '600', margin: 0 }}>{user.fullName || user.username}</p>
                                    {user.fullName && (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>@{user.username}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No likes yet.</p>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LikesModal;
