import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// NC-01: Hardcoded route in navigate() - safe pattern
export const NC01_HardcodedNavigation: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/dashboard');
  };

  return (
    <div>
      <button type="button" onClick={handleLogout}>Go to Dashboard</button>
    </div>
  );
};

// NC-02: Constant reference in navigate() - safe pattern
export const NC02_ConstantNavigation: React.FC = () => {
  const navigate = useNavigate();
  const LOGOUT_URL = '/logout';

  const handleLogout = () => {
    navigate(LOGOUT_URL);
  };

  return (
    <div>
      <button type="button" onClick={handleLogout}>Logout</button>
    </div>
  );
};

// NC-03: Non-sensitive data stored in localStorage - safe pattern
export const NC03_NonSensitiveStorage: React.FC = () => {
  const [theme, setTheme] = useState('dark');

  const savePreferences = () => {
    localStorage.setItem('theme', theme);
  };

  return (
    <div>
      <button onClick={savePreferences}>Save Theme</button>
    </div>
  );
};

// NC-04: Non-sensitive compound data stored in localStorage - safe pattern
export const NC04_NonSensitiveCompoundStorage: React.FC = () => {
  const [preferences, setPreferences] = useState({
    language: 'en',
    fontSize: 14,
    notifications: true
  });

  const savePreferences = () => {
    localStorage.setItem('userPrefs', JSON.stringify(preferences));
  };

  return (
    <div>
      <button onClick={savePreferences}>Save Preferences</button>
    </div>
  );
};

// NC-05: URL parameter displayed only, never reaches a sink - safe pattern
export const NC05_UrlParamDisplayOnly: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const lang = searchParams.get('lang') || 'en';

  return (
    <div>
      <p>Current language: {lang}</p>
    </div>
  );
};
