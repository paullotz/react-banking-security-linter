import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// DF-01: URL param → variable assignment → state setter → navigate() (multi-hop)
export const DF01_MultiHopUrlParam: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [redirectUrl, setRedirectUrl] = useState('');

  useEffect(() => {
    const rawParam = searchParams.get('url');
    const sanitizedParam = rawParam || '';
    setRedirectUrl(sanitizedParam);
  }, [searchParams]);

  const handleRedirect = () => {
    navigate(redirectUrl);
  };

  return (
    <div>
      <button type="button" onClick={handleRedirect}>Redirect</button>
    </div>
  );
};

// DF-02: DOM input → intermediate variable → state → navigate()
export const DF02_DomInputMultiHop: React.FC = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    setDestination(rawInput);
  };

  const handleNavigate = () => {
    navigate(destination);
  };

  return (
    <div>
      <input onChange={handleInputChange} placeholder="Destination" />
      <button type="button" onClick={handleNavigate}>Go</button>
    </div>
  );
};

// DF-03: Sensitive function return → variable → localStorage.setItem()
export const DF03_SensitiveFunctionReturn: React.FC = () => {
  const getSecretToken = (): string => {
    return 'jwt-abc.def.ghi';
  };

  const handleSave = () => {
    const myToken = getSecretToken();
    localStorage.setItem('app-token', myToken);
  };

  return (
    <div>
      <button onClick={handleSave}>Save Token</button>
    </div>
  );
};

// DF-04: URL param → state → conditional branch → navigate()
export const DF04_ConditionalTaintFlow: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [targetUrl, setTargetUrl] = useState('');

  useEffect(() => {
    const urlParam = searchParams.get('next');
    if (urlParam && urlParam.startsWith('/')) {
      setTargetUrl(urlParam);
    }
  }, [searchParams]);

  const handleProceed = () => {
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  return (
    <div>
      <button type="button" onClick={handleProceed}>Proceed</button>
    </div>
  );
};

// DF-05: Multiple sensitive variables stored in sequence
export const DF05_MultipleSensitiveStorage: React.FC = () => {
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  const handleSaveAll = () => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  return (
    <div>
      <button onClick={handleSaveAll}>Save All Tokens</button>
    </div>
  );
};
