
import { useState, useEffect } from 'react';
import api from '../utils/api';
import ExperienceCard from '../components/ExperienceCard';
import { User, MapPin, Star, Edit2, Camera, Save, X, BookOpen, Globe, LogOut, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' or 'visited'
    const { logout } = useAuth(); // Get logout function

    // Edit Form State
    const [editForm, setEditForm] = useState({
        fullName: '',
        bio: '',
        profilePicture: null
    });
    const [previewImage, setPreviewImage] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const userRes = await api.get('/auth/me');
            setUser(userRes.data);
            setEditForm({
                fullName: userRes.data.fullName || '',
                bio: userRes.data.bio || '',
                profilePicture: null
            });

            const reviewsRes = await api.get('/reviews/user');
            setReviews(reviewsRes.data);
        } catch (err) {
            console.error("Failed to load profile:", err);
            // navigate('/login'); // Optional redirect if auth fails
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('fullName', editForm.fullName);
        formData.append('bio', editForm.bio);
        if (editForm.profilePicture) {
            formData.append('profilePicture', editForm.profilePicture);
        }

        try {
            const res = await api.put('/auth/updatedetails', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(res.data);
            setIsEditing(false);
            setPreviewImage(null);
        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update profile");
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await api.delete(`/reviews/${reviewId}`);
                setReviews(reviews.filter(r => r._id !== reviewId));
                // Update review count locally or refetch
                setUser(prev => ({ ...prev, reviewCount: prev.reviewCount ? prev.reviewCount - 1 : 0 })); // Simplified
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Need simpler like handler for profile (or pass same one)
    const handleLikeReview = async (reviewId) => {
        try {
            const res = await api.put(`/reviews/${reviewId}/like`);
            setReviews(prev => prev.map(r => r._id === reviewId ? res.data : r));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading profile...</div>;
    if (!user) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Please login to view profile.</div>;

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '4rem' }}>
            {/* Profile Header */}
            <div className="glass-card" style={{ marginBottom: '2rem', textAlign: 'center', position: 'relative' }}>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    title="Edit Profile"
                >
                    {isEditing ? <X size={24} /> : <Edit2 size={24} />}
                </button>

                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
                    <div style={{
                        width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden',
                        border: '4px solid var(--primary)', margin: '0 auto',
                        background: 'var(--bg-card)'
                    }}>
                        <img
                            src={previewImage || (user.profilePicture ? `http://localhost:5000${user.profilePicture}` : `https://ui-avatars.com/api/?name=${user.username}&background=random`)}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    {isEditing && (
                        <label style={{
                            position: 'absolute', bottom: '0', right: '0',
                            background: 'var(--primary)', color: 'white',
                            borderRadius: '50%', width: '36px', height: '36px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                        }}>
                            <Camera size={18} />
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setEditForm({ ...editForm, profilePicture: file });
                                        setPreviewImage(URL.createObjectURL(file));
                                    }
                                }}
                            />
                        </label>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleUpdateProfile} style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={editForm.fullName}
                            onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                            style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                        />
                        <textarea
                            placeholder="Tell us about yourself..."
                            value={editForm.bio}
                            onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                            style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', resize: 'vertical', minHeight: '80px' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                            <Save size={18} style={{ marginRight: '0.5rem' }} /> Save Changes
                        </button>
                    </form>
                ) : (
                    <>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{user.fullName || user.username}</h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>@{user.username}</p>
                        {user.bio && <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>{user.bio}</p>}

                        {/* Stats Grid */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{user.visitedCountries?.length || 0}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <MapPin size={14} /> Countries Visited
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{reviews.length}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <BookOpen size={14} /> Reviews
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24' }}>{user.flagGameHighScore || 0}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Star size={14} /> High Score
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                            <button
                                onClick={() => navigate('/wanderlist')}
                                className="btn btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <List size={18} /> My Wanderlist
                            </button>
                            <button
                                onClick={() => { logout(); navigate('/'); }}
                                className="btn"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}
                            >
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                <button
                    onClick={() => setActiveTab('reviews')}
                    style={{
                        padding: '1rem',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'reviews' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'reviews' ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    My Reviews
                </button>
                <button
                    onClick={() => setActiveTab('visited')}
                    style={{
                        padding: '1rem',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'visited' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'visited' ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Visited Countries
                </button>
            </div>

            {/* Content */}
            {activeTab === 'reviews' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <ExperienceCard
                                key={review._id}
                                review={review}
                                currentUser={user}
                                onDelete={handleDeleteReview}
                                onLike={handleLikeReview}
                            />
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <p>You haven't written any reviews yet.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                    {user.visitedCountries && user.visitedCountries.length > 0 ? (
                        user.visitedCountries.map((countryName, idx) => (
                            <div key={idx} className="glass-card" style={{ padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
                                <Globe size={24} style={{ marginBottom: '0.5rem', color: 'var(--primary)' }} />
                                <span style={{ fontWeight: '500' }}>{countryName}</span>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <p>You haven't marked any countries as visited yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;
