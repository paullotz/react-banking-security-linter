import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// PC-01: URL parameter flows through state into navigate() (ASVS 5.1.5)
export const PC01_UrlParamToNavigate: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [redirectUrl, setRedirectUrl] = useState('');

  useEffect(() => {
    const urlParam = searchParams.get('redirect');
    if (urlParam) {
      setRedirectUrl(urlParam);
    }
  }, [searchParams]);

  const handleLogin = () => {
    navigate(redirectUrl);
  };

  return (
    <div>
      <button type="button" onClick={handleLogin}>Login</button>
    </div>
  );
};

// PC-02: DOM input flows through state into navigate() (ASVS 5.1.5)
export const PC02_DomInputToNavigate: React.FC = () => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState('');

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

// PC-03: Authentication token stored in localStorage (ASVS 14.3.3)
export const PC03_TokenInLocalStorage: React.FC = () => {
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    const token = getAuthTokenFromAPI();
    localStorage.setItem('token', token);
    setAuthToken(token);
  }, []);

  const getAuthTokenFromAPI = (): string => {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  };

  return (
    <div>
      <p>Authenticated: {authToken ? 'Yes' : 'No'}</p>
    </div>
  );
};

// PC-04: Session identifier stored in localStorage (ASVS 14.3.3)
export const PC04_SessionInLocalStorage: React.FC = () => {
  const [sessionId, setSessionId] = useState('');

  const handleLogin = () => {
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

// PC-05: Auth data object stored in localStorage (ASVS 14.3.3)
export const PC05_AuthInLocalStorage: React.FC = () => {
  const [userAuth, setUserAuth] = useState<any>(null);

  const saveAuthData = (authData: any) => {
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
