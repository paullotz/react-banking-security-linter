
    import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    
    export const MediumComponent = () => {
      const navigate = useNavigate();
      const [token, setToken] = useState('');
      
      const handleClick = () => {
        localStorage.setItem('authToken', token);
        navigate('/dashboard');
      };
      
      return <button onClick={handleClick}>Save</button>;
    };
  