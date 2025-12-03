import React from 'react';
import './Header.css';

/**
 * Header component with navigation tabs
 * Displays 3 tabs: Home, Analysis, Top Statistics
 */
const Header = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'statistics', label: 'Top Statistics' }
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <h1>Tentacool</h1>
        </div>
        <nav className="header-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`header-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;

