import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Statistics from './pages/Statistics';
import Download from './pages/Download';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  // Update active tab based on route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/analysis') {
      setActiveTab('analysis');
    } else if (path === '/statistics') {
      setActiveTab('statistics');
    } else if (path === '/') {
      setActiveTab('home');
    }
  }, [location]);

  // Handle tab change - navigate to appropriate route
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      navigate('/');
    } else {
      navigate(`/${tab}`);
    }
  };

  // If on download page, don't show header
  if (location.pathname === '/download') {
    return (
      <div className="App">
        <main className="App-main">
          <Download />
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="App-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/download" element={<Download />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
