import React, { useState, useEffect } from 'react';

export const InsecureTokenStorage: React.FC = () => {
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    // SECURITY ISSUE: Storing authentication token in localStorage
    const token = getAuthTokenFromAPI();
    localStorage.setItem('token', token);
    setAuthToken(token);
  }, []);

  const getAuthTokenFromAPI = (): string => {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Authenticated: {authToken ? 'Yes' : 'No'}</p>
    </div>
  );
};

export const InsecureSessionStorage: React.FC = () => {
  const [sessionId, setSessionId] = useState('');

  const handleLogin = () => {
    // SECURITY ISSUE: Storing session ID in localStorage
    const newSession = createSession();
    localStorage.setItem('session', newSession);
    setSessionId(newSession);
  };

  const createSession = (): string => {
    return 'session_' + Math.random().toString(36).substring(7);
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export const InsecureAuthStorage: React.FC = () => {
  const [userAuth, setUserAuth] = useState<any>(null);

  const saveAuthData = (authData: any) => {
    // SECURITY ISSUE: Storing authentication data in localStorage
    localStorage.setItem('auth', JSON.stringify(authData));
    setUserAuth(authData);
  };

  return (
    <div>
      <button onClick={() => saveAuthData({ userId: '123', token: 'secret' })}>
        Save Credentials
      </button>
    </div>
  );
};
