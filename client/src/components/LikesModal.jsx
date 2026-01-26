import { X } from 'lucide-react';
import { getMediaUrl } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const LikesModal = ({ isOpen, onClose, likedBy }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(4px)'
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
                    maxHeight: '80vh',
                    overflowY: 'auto'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Liked By</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
        </div>
    );
};

export default LikesModal;
