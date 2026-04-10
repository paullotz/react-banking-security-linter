import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const TaintedNavigationComponent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [redirectUrl, setRedirectUrl] = useState('');

  useEffect(() => {
    // This should trigger navigation-security rule
    // Tainted data from URL parameter directly used in navigation
    const urlParam = searchParams.get('redirect');
    if (urlParam) {
      setRedirectUrl(urlParam);
    }
  }, [searchParams]);

  const handleLogin = () => {
    // SECURITY ISSUE: Using unvalidated URL parameter in navigation
    navigate(redirectUrl);
  };

  return (
    <div>
      <h2>Login Page</h2>
      <button type="button" onClick={handleLogin}>Login</button>
    </div>
  );
};

export const AnotherTaintedNavigation: React.FC = () => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState('');

  // SECURITY ISSUE: Using user input directly in navigation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(userInput);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Enter redirect URL"
      />
      <button type="submit">Go</button>
    </form>
  );
};
