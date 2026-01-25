import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Countries from './pages/Countries';
import CountryDetails from './pages/CountryDetails';
import Wanderlist from './pages/Wanderlist';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import FlagGame from './pages/FlagGame';
import Profile from './pages/Profile';
import './styles/main.css';



import ErrorBoundary from './components/ErrorBoundary';

import LoadingScreen from './components/LoadingScreen';
import { useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';

const AppContent = () => {
  const { loading: authLoading } = useAuth();
  const [minLoading, setMinLoading] = useState(true);
  const [forceHide, setForceHide] = useState(false);

  useEffect(() => {
    // Ensure loading screen shows for at least 1.5 seconds (reduced for better UX)
    const minTimer = setTimeout(() => setMinLoading(false), 1500);

    // Failsafe: Force stop loading after 5 seconds in case auth hangs
    const maxTimer = setTimeout(() => {
      setForceHide(true);
    }, 5000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  // Show loading only if authenticating OR min time hasn't passed, AND we haven't timed out
  const isLoading = (authLoading || minLoading) && !forceHide;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isLoading && <LoadingScreen onDismiss={() => setForceHide(true)} />}
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/countries/:name" element={<CountryDetails />} />
          <Route path="/wanderlist" element={<Wanderlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/game" element={<FlagGame />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
