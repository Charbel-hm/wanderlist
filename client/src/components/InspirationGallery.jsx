const InspirationGallery = () => {
    const destinations = [
        {
            title: "Urban Culture",
            subtitle: "Kyoto, Japan",
            img: "/assets/img_japan.png",
            size: "large"
        },
        {
            title: "Mountain Escape",
            subtitle: "Swiss Alps",
            img: "/assets/img_mountain.png",
            size: "small"
        },
        {
            title: "Coastal Bliss",
            subtitle: "Amalfi Coast",
            img: "/assets/img_coast.png",
            size: "medium"
        }
    ];

    return (
        <section style={{ padding: '6rem 0' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        Find Your Inspiration
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        From neon-lit streets to serene peaks, the world is waiting.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    gridAutoRows: '300px'
                }}>
                    {destinations.map((dest, index) => (
                        <div key={index} className="glass-card" style={{
                            position: 'relative',
                            overflow: 'hidden',
                            padding: 0,
                            gridRow: dest.size === 'large' ? 'span 2' : 'span 1',
                            cursor: 'pointer',
                            group: 'group' // Using class based hover usually, but inline styles for quick iteration
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.querySelector('img').style.transform = 'scale(1.1)';
                                e.currentTarget.querySelector('.overlay').style.background = 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.querySelector('img').style.transform = 'scale(1)';
                                e.currentTarget.querySelector('.overlay').style.background = 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)';
                            }}
                        >
                            <img
                                src={dest.img}
                                alt={dest.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.6s ease'
                                }}
                            />
                            <div className="overlay" style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                padding: '2rem',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                                transition: 'background 0.3s ease'
                            }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{dest.title}</h3>
                                <p style={{ color: 'var(--primary)', fontWeight: 600 }}>{dest.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InspirationGallery;
