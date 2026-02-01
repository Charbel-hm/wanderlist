import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import api, { getMediaUrl } from '../utils/api';
import ExperienceCard from '../components/ExperienceCard';
import { MapPin, Users, DollarSign, Languages, Star, Plus, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, Grid } from 'lucide-react';
import { formatPopulation } from '../utils/formatters';
import LoadingScreen from '../components/LoadingScreen';
import '../styles/CountryDetails.css';
import { useNotification } from '../context/NotificationContext';
import ConfirmationModal from '../components/ConfirmationModal';

const CountryDetails = () => {
    const { name } = useParams();
    const location = useLocation();
    const { showNotification } = useNotification();
    const [country, setCountry] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isInWanderlist, setIsInWanderlist] = useState(false);
    const token = localStorage.getItem('token');

    const [headerImage, setHeaderImage] = useState(null);
    const [wikiData, setWikiData] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [expandedSections, setExpandedSections] = useState({}); // Default all closed
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAllGallery, setShowAllGallery] = useState(false);
    const [videoId, setVideoId] = useState(null);
    const [videoLoading, setVideoLoading] = useState(true);
    const videoRef = useRef(null);
    const scrollRef = useRef(null);
    const reviewRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [lightbox, setLightbox] = useState({ isOpen: false, media: [], index: 0 });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [visited, setVisited] = useState(false);
    const [ratingsStats, setRatingsStats] = useState({ average: 0, count: 0 });
    const [userRating, setUserRating] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const countryRes = await api.get(`/countries/${name}`);
                const countryData = countryRes.data[0];
                setCountry(countryData);
                // Set default flag as fallback immediately
                setHeaderImage(countryData.flags.svg);

                // Fetch detailed wiki content
                try {
                    const wikiContentRes = await api.get(`/wiki/${countryData.name.common}`);
                    setWikiData(wikiContentRes.data);
                } catch (err) {
                    console.warn("Wiki content fetch failed:", err);
                }

                // Fetch gallery images
                try {
                    const imagesRes = await api.get(`/wiki/images/${countryData.name.common}`);
                    setGalleryImages(imagesRes.data);
                } catch (err) {
                    console.warn("Gallery fetch failed:", err);
                }

                // Fetch landmark image
                try {
                    let wikiRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/Tourism_in_${countryData.name.common}`);
                    if (!wikiRes.data.originalimage) {
                        wikiRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/Geography_of_${countryData.name.common}`);
                    }
                    if (wikiRes.data.originalimage) {
                        setHeaderImage(wikiRes.data.originalimage.source);
                    }
                } catch (wikiErr) {
                    console.warn("Wiki image fetch failed, keeping flag:", wikiErr);
                }

                const reviewsRes = await api.get(`/reviews/${name}`);
                setReviews(reviewsRes.data);

                // Fetch Ratings Stats
                try {
                    const statsRes = await api.get(`/ratings/${countryData.name.common}`);
                    setRatingsStats(statsRes.data);
                } catch (err) {
                    console.warn("Ratings fetch failed", err);
                }

                if (token) {
                    const wanderlistRes = await api.get('/wanderlist');
                    const exists = wanderlistRes.data.some(c => c.name === countryData.name.common);
                    setIsInWanderlist(exists);

                    // Fetch Current User & User Rating
                    try {
                        const userRes = await api.get('/auth/me');
                        setCurrentUser(userRes.data);
                        if (userRes.data.visitedCountries && userRes.data.visitedCountries.includes(countryData.name.common)) {
                            setVisited(true);
                        }

                        const ratingRes = await api.get(`/ratings/${countryData.name.common}/user`);
                        setUserRating(ratingRes.data.rating);
                    } catch (err) {
                        console.error('Error fetching user data', err);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [name, token]);

    // Handle Hash Scrolling
    useEffect(() => {
        if (location.hash && reviews.length > 0 && !loading) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Optional: Add a highlight effect
                    element.style.transition = 'background 0.5s';
                    element.style.background = 'rgba(52, 211, 153, 0.2)';
                    setTimeout(() => {
                        element.style.background = 'transparent';
                    }, 2000);
                }, 500); // Small delay to ensure render
            }
        }
    }, [location.hash, reviews, loading]);


    // Scroll helper
    const scrollToReviews = () => {
        reviewRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch YouTube video
    useEffect(() => {
        const fetchVideo = async () => {
            try {
                setVideoLoading(true);
                const res = await api.get(`/youtube/video/${country.name.common}`);
                if (res.data.videoId) {
                    setVideoId(res.data.videoId);
                }
            } catch (err) {
                console.warn('Failed to fetch YouTube video:', err);
                // Will use fallback search embed
            } finally {
                setVideoLoading(false);
            }
        };

        if (country) {
            fetchVideo();
        }
    }, [country]);

    // Pause video when scrolled away using postMessage API
    // Pause video when scrolled away using postMessage API
    useEffect(() => {
        // Robust polling to ensure we attach only when ready
        const checkAndAttach = setInterval(() => {
            const container = videoRef.current;
            if (!container) return;

            // Check if iframe is actually rendered inside
            const iframe = container.querySelector('iframe');
            if (!iframe) return;

            console.log('✅ Video Observer: Container & Iframe found. Attaching...', { videoId });
            clearInterval(checkAndAttach); // Stop polling

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        // Check iframe again inside callback just to be safe
                        const currentIframe = container.querySelector('iframe');
                        if (currentIframe && currentIframe.contentWindow) {
                            if (entry.isIntersecting) {
                                console.log('🎬 Video In View - sending PLAY');
                                currentIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                            } else {
                                console.log('Hz Video Out of View - sending PAUSE');
                                currentIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                            }
                        }
                    });
                },
                {
                    threshold: 0.2 // 20% visibility
                }
            );

            observer.observe(container);

            // Store observer in a cleanup function variable if needed, 
            // but since we are inside an interval that clears itself, 
            // we need a mechanism to cleanup the observer if the component unmounts *after* attachment.
            // We can store it on the element or a ref, but for now let's use a module-level variable or just relying on React cleanup?
            // Actually, we need to be careful. The cleanup function of useEffect runs only once.
            // If we create observer asynchronously, we need a ref to store it for cleanup.
            videoRef.current.__observer = observer;

        }, 500);

        return () => {
            clearInterval(checkAndAttach);
            if (videoRef.current && videoRef.current.__observer) {
                console.log('🧹 Formatting observer cleanup');
                videoRef.current.__observer.disconnect();
                delete videoRef.current.__observer;
            }
        };
    }, [videoId]); // Removed videoLoading dependency effectively by polling, but logic implies we wait for it.

    // Auto-scroll carousel
    useEffect(() => {
        if (!scrollRef.current || galleryImages.length === 0) return;

        const scrollContainer = scrollRef.current;
        let scrollInterval;

        const startAutoScroll = () => {
            scrollInterval = setInterval(() => {
                if (scrollContainer) {
                    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
                    const currentScroll = scrollContainer.scrollLeft;

                    if (currentScroll >= maxScroll - 10) {
                        // Reset to beginning smoothly
                        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        // Scroll forward
                        scrollContainer.scrollBy({ left: 320, behavior: 'smooth' });
                    }
                }
            }, 3000);
        };

        startAutoScroll();

        return () => clearInterval(scrollInterval);
    }, [galleryImages]);


    const handleAddToWanderlist = async () => {
        if (!token) return showNotification('Please login to add to Wanderlist', 'warning');
        try {
            await api.post('/wanderlist', {
                name: country.name.common,
                flag: country.flags.svg,
                region: country.region
            });
            setIsInWanderlist(true);
            showNotification('Added to your Wanderlist!', 'success');
        } catch (err) {
            console.error(err);
            showNotification('Error adding to wanderlist', 'error');
        }
    };



    const handleLikeReview = async (reviewId) => {
        if (!token) return showNotification('Please login to like reviews', 'warning');
        try {
            const res = await api.put(`/reviews/${reviewId}/like`);
            setReviews(prev => prev.map(r => r._id === reviewId ? res.data : r));
        } catch (err) {
            console.error(err);
        }
    };

    const handleRate = async (newRating) => {
        if (!token) return showNotification('Please login to rate', 'warning');
        try {
            await api.post('/ratings', {
                countryName: country.name.common,
                rating: newRating
            });
            setUserRating(newRating);
            // Refresh stats
            const statsRes = await api.get(`/ratings/${country.name.common}`);
            setRatingsStats(statsRes.data);
            showNotification('Rating updated!', 'success');
        } catch (err) {
            console.error(err);
            showNotification('Error updating rating', 'error');
        }
    };

    const handlePostReview = async (e) => {
        e.preventDefault();
        if (!token) return showNotification('Please login to share experience', 'warning');

        try {
            // Always create new
            const formData = new FormData();
            formData.append('countryName', country.name.common);
            formData.append('comment', comment.trim());

            selectedFiles.forEach(file => {
                formData.append('media', file);
            });

            // Upload using configured api instance
            const res = await api.post('/reviews', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setReviews([res.data, ...reviews]);
            setComment('');
            setSelectedFiles([]);
            setVisited(true);
            showNotification('Experience shared successfully!', 'success');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.msg || 'Error posting review';
            showNotification(msg, 'error');
        }
    };

    const handleDeleteReview = (reviewId) => {
        setReviewToDelete(reviewId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!reviewToDelete) return;
        try {
            await api.delete(`/reviews/${reviewToDelete}`);
            setReviews(reviews.filter(r => r._id !== reviewToDelete));
            setReviewToDelete(null);
            setShowDeleteModal(false);
            showNotification('Review deleted', 'success');
        } catch (err) {
            console.error(err);
            showNotification('Error deleting review', 'error');
        }
    };

    const openLightbox = (media, index) => {
        setLightbox({ isOpen: true, media, index });
    };

    const closeLightbox = () => {
        setLightbox({ ...lightbox, isOpen: false });
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setLightbox(prev => ({
            ...prev,
            index: (prev.index + 1) % prev.media.length
        }));
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setLightbox(prev => ({
            ...prev,
            index: (prev.index - 1 + prev.media.length) % prev.media.length
        }));
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };



    if (loading) return <LoadingScreen />;
    if (!country) return <div className="container" style={{ paddingTop: '100px' }}>Country not found</div>;


    return (
        <div className="country-details-page">
            {/* Header */}
            <div className="country-header">
                <div className="country-header-bg" style={{
                    backgroundImage: `url(${headerImage})`
                }}></div>
                <div className="container">
                    <h1 className="header-title" style={{ marginBottom: '1rem' }}>{country.name.common}</h1>
                    <div className="header-meta">
                        <span>{country.region}</span>
                        <span>Capital: {country.capital?.[0]}</span>
                    </div>
                </div>

            </div>


            <div className="container details-grid" style={{ marginBottom: '3rem' }}>

                {/* Main Content: About & Deep Dive */}
                <div>
                    <div className="glass-card" style={{ marginBottom: '3rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>About {country.name.common}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Users color="var(--primary)" />
                                <span>Population: {formatPopulation(country.population)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Languages color="var(--secondary)" />
                                <span>Languages: {Object.values(country.languages || {}).join(', ')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <DollarSign color="gold" />
                                <span>Currency: {Object.values(country.currencies || {}).map(c => c.name).join(', ')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <MapPin color="var(--primary)" />
                                <span>Subregion: {country.subregion}</span>
                            </div>
                        </div>
                    </div>

                    {wikiData && (
                        <div className="glass-card deep-dive-card">
                            <h2 className="deep-dive-title">Deep Dive: {country.name.common}</h2>

                            {['History', 'Culture', 'Cuisine', 'Geography', 'Tourism'].map(section => {
                                const key = section.toLowerCase();
                                if (!wikiData[key]) return null;
                                const isOpen = expandedSections[key];

                                return (
                                    <div key={key} className="accordion-item">
                                        <button
                                            onClick={() => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))}
                                            className="accordion-trigger"
                                            style={{
                                                background: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
                                            }}
                                        >
                                            {section}
                                            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                        {isOpen && (
                                            <div
                                                className="accordion-content"
                                                dangerouslySetInnerHTML={{ __html: wikiData[key] }}
                                                onClick={(e) => {
                                                    if (e.target.classList.contains('clickable-wiki-image')) {
                                                        setSelectedImage({
                                                            url: e.target.dataset.fullRes || e.target.src,
                                                            title: section,
                                                            description: 'From Wikipedia article'
                                                        });
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div>
                    <div className="glass-card sidebar-sticky">
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Average Rating</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>{ratingsStats.average}</span>
                                <Star size={28} fill="gold" color="gold" />
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                ({ratingsStats.count > 0 ? `${ratingsStats.count} travelers` : 'No ratings yet'})
                            </p>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Rate your experience</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star
                                        key={i}
                                        size={32}
                                        fill={i <= userRating ? "gold" : "none"}
                                        color={i <= userRating ? "gold" : "rgba(255,255,255,0.2)"}
                                        onClick={() => handleRate(i)}
                                        style={{ transition: 'transform 0.2s', transform: i <= userRating ? 'scale(1.1)' : 'scale(1)' }}
                                    />
                                ))}
                            </div>
                            {userRating > 0 && <p style={{ color: 'gold', fontSize: '0.8rem', marginTop: '0.5rem' }}>You rated this {userRating} stars</p>}
                        </div>

                        <button
                            onClick={handleAddToWanderlist}
                            className={`btn ${isInWanderlist ? 'btn-secondary' : 'btn-primary'}`}
                            style={{ width: '100%', marginBottom: '1rem' }}
                            disabled={isInWanderlist}
                        >
                            {isInWanderlist ? (
                                <><Check size={18} style={{ marginRight: '0.5rem' }} /> In Wanderlist</>
                            ) : (
                                <><Plus size={18} style={{ marginRight: '0.5rem' }} /> Add to Wanderlist</>
                            )}
                        </button>

                        <button
                            onClick={async () => {
                                if (!token) return showNotification('Please login first', 'warning');
                                try {
                                    if (visited) {
                                        await api.delete(`/users/visited/${country.name.common}`);
                                        setVisited(false);
                                    } else {
                                        await api.post('/users/visited', { countryName: country.name.common });
                                        setVisited(true);
                                    }
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                            className="btn"
                            style={{
                                width: '100%',
                                background: visited ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                color: visited ? '#34d399' : 'white',
                                border: visited ? '1px solid #34d399' : '1px solid var(--glass-border)'
                            }}
                        >
                            {visited ? (
                                <><Check size={18} style={{ marginRight: '0.5rem' }} /> Visited</>
                            ) : (
                                <><MapPin size={18} style={{ marginRight: '0.5rem' }} /> Mark as Visited</>
                            )}
                        </button>
                    </div>
                </div>

            </div>


            {/* Cinematic Gallery */}
            {
                galleryImages.length > 0 && (
                    <div style={{ width: '100%', marginBottom: '4rem', padding: '2rem 0', background: 'rgba(0,0,0,0.2)' }}>
                        <div className="container" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Cinematic Gallery</h2>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Curated highlights from {country.name.common}
                            </p>
                        </div>

                        <div
                            ref={scrollRef}
                            style={{
                                display: 'flex',
                                gap: '1.5rem',
                                overflowX: 'auto',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                padding: '0 5vw 2rem',
                                scrollBehavior: 'smooth'
                            }}
                            className="hide-scrollbar"
                        >
                            {galleryImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    style={{
                                        minWidth: 'min(80vw, 350px)',
                                        width: 'min(80vw, 350px)',
                                        height: '450px',
                                        borderRadius: '1rem',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        background: '#222',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                        transition: 'transform 0.3s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <img
                                        src={img.url}
                                        alt={img.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        loading="lazy"
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                        padding: '2rem 1.5rem',
                                        pointerEvents: 'none'
                                    }}>
                                        <p style={{ color: 'white', margin: 0, fontWeight: 'bold', fontSize: '1.25rem' }}>{img.title}</p>
                                        {img.description && <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '1rem', marginTop: '0.5rem' }}>{img.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* Cinematic Tour */}
            <div style={{ width: '100%', marginBottom: '4rem', padding: '4rem 0', background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%)' }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '2.5rem' }}>Cinematic Tour</h2>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem' }}>
                            Experience {country.name.common} through video
                        </p>
                    </div>
                    <div ref={videoRef} style={{
                        position: 'relative',
                        paddingBottom: '56.25%',
                        height: 0,
                        borderRadius: '1.5rem',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        border: '2px solid rgba(255,255,255,0.1)'
                    }}>
                        {videoLoading ? (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(0,0,0,0.8)',
                                color: 'var(--text-muted)',
                                fontSize: '1.2rem'
                            }}>
                                Loading video...
                            </div>
                        ) : (
                            <iframe
                                src={videoId
                                    ? `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0&loop=1&playlist=${videoId}&enablejsapi=1`
                                    : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(country.name.common + ' travel 4k')}&autoplay=0&mute=0&loop=1&enablejsapi=1`
                                }
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Country Video Tour"
                            ></iframe>
                        )}
                    </div>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Traveler Experiences</h2>

                {/* Add/Edit Review Form */}
                {token ? (
                    <div ref={reviewRef} className="glass-card" style={{ marginBottom: '2rem', scrollMarginTop: '100px' }}>
                        <h3 style={{ marginBottom: '1rem' }}>
                            Share Your Experience
                        </h3>
                        <form onSubmit={handlePostReview}>

                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell us about your trip (optional)..."
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-main)',
                                    marginBottom: '1rem',
                                    resize: 'vertical'
                                }}
                            />

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    cursor: 'pointer',
                                    color: 'var(--primary)'
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Plus size={16} /> Add Photos/Videos
                                    </span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                {selectedFiles.length > 0 && (
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                                        {selectedFiles.map((file, i) => (
                                            <div key={i} style={{ position: 'relative', width: '100px', height: '100px' }}>
                                                {file.type.startsWith('image/') ? (
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt="preview"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
                                                    />
                                                ) : (
                                                    <video
                                                        src={URL.createObjectURL(file)}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
                                                    />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(i)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-5px',
                                                        right: '-5px',
                                                        background: '#64748b',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '20px',
                                                        height: '20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#ef4444'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = '#64748b'}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Post
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div ref={reviewRef} className="glass-card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '3rem', scrollMarginTop: '100px' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Have you been here?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Log in to share your experience, photos, and tips with other travelers.
                        </p>
                        <a href="/login" className="btn btn-primary">Login to Post</a>
                    </div>
                )}

                {/* Reviews List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review._id} id={`post-${review._id}`}>
                                <ExperienceCard
                                    review={review}
                                    currentUser={currentUser}
                                    onDelete={handleDeleteReview}
                                    onImageClick={openLightbox}
                                    onLike={handleLikeReview}
                                />
                            </div>
                        ))
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No posts yet. Be the first!</p>
                    )}
                </div>
            </div>
            {/* Lightbox Modal */}
            {
                selectedImage && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(0,0,0,0.95)',
                            zIndex: 9999,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '2rem'
                        }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                            style={{
                                position: 'absolute', top: '2rem', right: '2rem',
                                background: 'transparent', border: 'none', color: 'white', cursor: 'pointer'
                            }}
                        >
                            <X size={32} />
                        </button>

                        <button
                            onClick={prevImage}
                            style={{
                                position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                                borderRadius: '50%', width: '50px', height: '50px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                backdropFilter: 'blur(5px)'
                            }}
                        >
                            <ChevronLeft size={32} />
                        </button>

                        <div style={{ maxHeight: '90vh', maxWidth: '90vw', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            <img
                                src={selectedImage.url}
                                alt={selectedImage.title}
                                style={{ maxHeight: '80vh', maxWidth: '100%', objectFit: 'contain', borderRadius: '0.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                            />
                            <div style={{ marginTop: '1rem', color: 'white' }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{selectedImage.title}</h3>
                                {selectedImage.description && <p style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedImage.description}</p>}
                            </div>
                        </div>

                        <button
                            onClick={nextImage}
                            style={{
                                position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                                borderRadius: '50%', width: '50px', height: '50px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                backdropFilter: 'blur(5px)'
                            }}
                        >
                            <ChevronRight size={32} />
                        </button>
                    </div>
                )
            }

            {/* All Photos Grid Modal */}
            {
                showAllGallery && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(0,0,0,0.95)',
                            zIndex: 9999,
                            padding: '2rem',
                            overflowY: 'auto'
                        }}
                    >
                        <div className="container">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ color: 'white', margin: 0 }}>All Photos</h2>
                                    <p style={{ color: 'var(--text-muted)' }}>{country.name.common}</p>
                                </div>
                                <button
                                    onClick={() => setShowAllGallery(false)}
                                    style={{
                                        background: 'transparent', border: 'none', color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X size={48} />
                                </button>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {galleryImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => { setSelectedImage(img); }}
                                        style={{
                                            borderRadius: '0.5rem',
                                            overflow: 'hidden',
                                            aspectRatio: '2/3',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            background: '#222'
                                        }}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Experience?"
                message="Are you sure you want to delete this experience? This action cannot be undone."
                confirmText="Yes, Delete"
                isDangerous={true}
            />

            {/* Review Lightbox Modal */}
            {
                lightbox.isOpen && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(0,0,0,0.95)',
                            zIndex: 9999,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            style={{
                                position: 'absolute', top: '2rem', right: '2rem',
                                background: 'transparent', border: 'none', color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={48} />
                        </button>

                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                            {lightbox.media.length > 1 && (
                                <button
                                    onClick={prevImage}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                                        cursor: 'pointer', padding: '1rem', borderRadius: '50%',
                                        marginRight: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <ChevronLeft size={32} />
                                </button>
                            )}

                            {lightbox.media[lightbox.index].match(/\.(mp4|webm|mov)$/i) ? (
                                <video
                                    src={getMediaUrl(lightbox.media[lightbox.index])}
                                    controls
                                    autoPlay
                                    style={{ maxHeight: '80vh', maxWidth: '100%', borderRadius: '0.5rem', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}
                                />
                            ) : (
                                <img
                                    src={getMediaUrl(lightbox.media[lightbox.index])}
                                    alt="Review media"
                                    style={{ maxHeight: '80vh', maxWidth: '100%', borderRadius: '0.5rem', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}
                                />
                            )}

                            {lightbox.media.length > 1 && (
                                <button
                                    onClick={nextImage}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                                        cursor: 'pointer', padding: '1rem', borderRadius: '50%',
                                        marginLeft: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <ChevronRight size={32} />
                                </button>
                            )}

                            <div style={{ position: 'absolute', bottom: '-40px', left: 0, width: '100%', textAlign: 'center', color: '#888' }}>
                                {lightbox.index + 1} / {lightbox.media.length}
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
};

export default CountryDetails;
