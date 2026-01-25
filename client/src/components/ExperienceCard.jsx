import { Star, Heart } from 'lucide-react';

const ExperienceCard = ({ review, currentUser, onDelete, onImageClick, onLike }) => {
    return (
        <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {review.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p style={{ fontWeight: '600' }}>@{review.username}</p>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={12}
                                    fill={i < review.rating ? 'gold' : 'none'}
                                    color={i < review.rating ? 'gold' : '#64748b'}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                </span>
            </div>

            <p style={{ color: 'var(--text-main)', marginBottom: '1rem', lineHeight: '1.6' }}>
                "{review.comment}"
            </p>

            {review.media && review.media.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {review.media.map((path, idx) => {
                        const isVideo = path.match(/\.(mp4|webm)$/i);
                        const fullPath = `http://localhost:5000${path}`;

                        return isVideo ? (
                            <video
                                key={idx}
                                src={fullPath}
                                controls
                                style={{ height: '150px', borderRadius: '0.5rem' }}
                            />
                        ) : (
                            <img
                                key={idx}
                                src={fullPath}
                                alt="Review media"
                                style={{ height: '150px', borderRadius: '0.5rem', cursor: 'pointer' }}
                                onClick={() => onImageClick && onImageClick(review.media, idx)}
                            />
                        );
                    })}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                    onClick={() => onLike && onLike(review._id)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--secondary)',
                        fontSize: '0.9rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                    }}
                >
                    <Heart
                        size={16}
                        fill={review.likedBy?.includes(currentUser?._id) ? "#ef4444" : "none"}
                        color={review.likedBy?.includes(currentUser?._id) ? "#ef4444" : "gold"}
                    />
                    {review.likes} Likes
                </button>
                {currentUser && currentUser._id === review.userId && (
                    <button
                        onClick={() => onDelete(review._id)}
                        style={{
                            background: 'transparent',
                            color: '#f87171',
                            border: '1px solid rgba(248, 113, 113, 0.2)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(248, 113, 113, 0.1)'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
};

export default ExperienceCard;
