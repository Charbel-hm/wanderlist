import { Star, Heart, User } from 'lucide-react';
import { getMediaUrl } from '../utils/api';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import LikesModal from './LikesModal';

const ExperienceCard = ({ review, currentUser, onDelete, onImageClick, onLike }) => {
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likedByUsers, setLikedByUsers] = useState([]);

    const handleShowLikes = async (e) => {
        e.stopPropagation();
        if (review.likes === 0) return;

        try {
            const res = await api.get(`/reviews/${review._id}/likes`);
            setLikedByUsers(res.data);
            setShowLikesModal(true);
        } catch (err) {
            console.error("Failed to fetch likes", err);
        }
    };

    return (
        <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <Link to={`/profile/${review.username}`} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        {(review.userId?.profilePicture) ? (
                            <img
                                src={getMediaUrl(review.userId.profilePicture)}
                                alt={review.username}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.textContent = review.username.charAt(0).toUpperCase();
                                }}
                            />
                        ) : (
                            review.username.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div>
                        <p style={{ fontWeight: '600', marginBottom: '0', lineHeight: '1.2' }}>
                            {review.userId?.fullName || review.fullName || review.username}
                        </p>
                        {(review.userId?.fullName || review.fullName) && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                @{review.username}
                            </p>
                        )}

                    </div>
                </Link>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                </span>
            </div>

            {review.comment && (
                <p style={{ color: 'var(--text-main)', marginBottom: '1rem', lineHeight: '1.6' }}>
                    "{review.comment}"
                </p>
            )}

            {review.media && review.media.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {review.media.map((path, idx) => {
                        // Check for video extensions (case insensitive)
                        const isVideo = /\.(mp4|webm|mov)$/i.test(path);
                        const fullPath = getMediaUrl(path);

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
                                style={{ height: '150px', borderRadius: '0.5rem', cursor: 'pointer', objectFit: 'cover' }}
                                onClick={() => onImageClick && onImageClick(review.media, idx)}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://placehold.co/150x150?text=Image+Error'; // Fallback
                                }}
                            />
                        );
                    })}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                            fill={review.likedBy?.some(id => id.toString() === currentUser?._id?.toString()) ? "#ef4444" : "none"}
                            color={review.likedBy?.some(id => id.toString() === currentUser?._id?.toString()) ? "#ef4444" : "gold"}
                        />
                    </button>
                    <span
                        onClick={handleShowLikes}
                        style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-muted)',
                            cursor: review.likes > 0 ? 'pointer' : 'default',
                            textDecoration: 'none'
                        }}
                    >
                        {review.likes} Likes
                    </span>
                </div>

                {currentUser && (currentUser._id === review.userId || currentUser._id === review.userId?._id) && (
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

            <LikesModal
                isOpen={showLikesModal}
                onClose={() => setShowLikesModal(false)}
                likedBy={likedByUsers}
            />
        </div>
    );
};

export default ExperienceCard;
