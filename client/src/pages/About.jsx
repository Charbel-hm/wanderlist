const About = () => {
    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '4rem', maxWidth: '800px' }}>
            <div className="glass-card" style={{ padding: '4rem' }}>
                <h1 className="title" style={{ fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>What is Wanderlist?</h1>

                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.8' }}>
                    Wanderlist is a travel-focused web platform designed for people who love discovering the world.
                    Whether you’re planning your next adventure or reminiscing about past trips, Wanderlist lets you explore countries, save destinations, and share authentic travel experiences.
                </p>

                <div style={{
                    borderLeft: '4px solid var(--primary)',
                    paddingLeft: '2rem',
                    margin: '3rem 0',
                    fontStyle: 'italic',
                    fontSize: '1.5rem'
                }}>
                    "Our goal is simple: to bring travelers together through shared experiences and inspiration."
                </div>

                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                    Built with <span style={{ color: 'var(--secondary)' }}>❤</span>
                    <br/>
                    Go explore the world!
                </p>
            </div>
        </div>
    );
};

export default About;
