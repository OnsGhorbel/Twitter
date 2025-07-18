import React, { useState, useEffect } from 'react';
import ApimanHelper from '../services/apimanHelper';
import API_CONFIG from '../config/apiConfig';

const ApimanStatus = () => {
  const [status, setStatus] = useState({
    isConnected: false,
    isConfigValid: false,
    apiKey: false,
    testing: false,
    error: null
  });

  useEffect(() => {
    checkApimanStatus();
  }, []);

  const checkApimanStatus = async () => {
    setStatus(prev => ({ ...prev, testing: true, error: null }));
    
    try {
      // Validate configuration
      const isConfigValid = ApimanHelper.validateConfig();
      
      // Check if API key is configured
      const apiKey = !!API_CONFIG.APIMAN_CONFIG.apiKey;
      
      // Test connection
      const isConnected = await ApimanHelper.testConnection();
      
      setStatus({
        isConnected,
        isConfigValid,
        apiKey,
        testing: false,
        error: null
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        testing: false,
        error: error.message
      }));
    }
  };

  const getStatusColor = (condition) => {
    if (status.testing) return '#FFA500'; // Orange
    return condition ? '#17BF63' : '#E0245E'; // Green or Red
  };

  const getStatusText = (condition, trueText, falseText) => {
    if (status.testing) return 'Testing...';
    return condition ? trueText : falseText;
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e1e8ed',
      minWidth: '280px',
      fontSize: '14px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
        fontWeight: 'bold'
      }}>
        <span style={{ marginRight: '8px' }}>🔗</span>
        Apiman Connection Status
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Configuration:</span>
          <span style={{ 
            color: getStatusColor(status.isConfigValid),
            fontWeight: 'bold'
          }}>
            {getStatusText(status.isConfigValid, '✓ Valid', '✗ Invalid')}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>API Key:</span>
          <span style={{ 
            color: getStatusColor(status.apiKey),
            fontWeight: 'bold'
          }}>
            {getStatusText(status.apiKey, '✓ Set', '✗ Missing')}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Connection:</span>
          <span style={{ 
            color: getStatusColor(status.isConnected),
            fontWeight: 'bold'
          }}>
            {getStatusText(status.isConnected, '✓ Connected', '✗ Failed')}
          </span>
        </div>
      </div>
      
      {status.error && (
        <div style={{
          marginTop: '12px',
          padding: '8px',
          background: '#FDF2F2',
          border: '1px solid #FECACA',
          borderRadius: '4px',
          color: '#E0245E',
          fontSize: '12px'
        }}>
          Error: {status.error}
        </div>
      )}
      
      <div style={{ marginTop: '12px' }}>
        <button
          onClick={checkApimanStatus}
          disabled={status.testing}
          style={{
            background: '#1DA1F2',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: status.testing ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            opacity: status.testing ? 0.6 : 1
          }}
        >
          {status.testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>
      
      <div style={{ 
        marginTop: '8px', 
        fontSize: '11px', 
        color: '#657786'
      }}>
        {API_CONFIG.USE_MOCK_API ? 'Using Mock API' : 'Using Real API'}
      </div>
    </div>
  );
};

export default ApimanStatus;
