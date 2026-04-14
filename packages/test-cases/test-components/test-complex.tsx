
    import React, { useState, useEffect, useCallback, useContext } from 'react';
    import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
    import AuthContext from './AuthContext';
    
    export const ComplexBankingComponent = ({ userToken }) => {
      const [balance, setBalance] = useState(0);
      const [transactions, setTransactions] = useState([]);
      const [isLoading, setIsLoading] = useState(false);
      const [sessionKey, setSessionKey] = useState('');
      
      const navigate = useNavigate();
      const [searchParams] = useSearchParams();
      const location = useLocation();
      const authContext = useContext(AuthContext);
      
      const urlParam = searchParams.get('redirect');
      const returnUrl = searchParams.get('returnUrl');
      
      const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/data', {
            headers: { Authorization: `Bearer ${userToken}` }
          });
          const data = await response.json();
          setBalance(data.balance);
          setTransactions(data.transactions);
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setIsLoading(false);
        }
      }, [userToken]);
      
      const handleRedirect = () => {
        if (urlParam) {
          navigate(urlParam);
        } else if (returnUrl) {
          navigate(returnUrl);
        }
      };
      
      const saveCredentials = () => {
        localStorage.setItem('token', userToken);
        localStorage.setItem('session', sessionKey);
        localStorage.setItem('apiKey', authContext.apiKey);
      };
      
      useEffect(() => {
        fetchData();
        const saved = localStorage.getItem('savedToken');
        if (saved) {
          setSessionKey(saved);
        }
      }, [fetchData]);
      
      if (location.pathname.includes('admin') && !userToken) {
        navigate('/login?redirect=' + encodeURIComponent(location.pathname));
      }
      
      return (
        <div>
          <h1>Banking Dashboard</h1>
          {isLoading && <p>Loading...</p>}
          <p>Balance: {balance}</p>
          <button onClick={handleRedirect}>Process</button>
          <button onClick={saveCredentials}>Save</button>
        </div>
      );
    };
  