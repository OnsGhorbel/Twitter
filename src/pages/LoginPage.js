import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, clearError } from '../auth/authSlice';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Login validation
      if (!formData.email || !formData.password) {
        return;
      }
      
      try {
        await dispatch(loginUser({
          email: formData.email,
          password: formData.password,
        })).unwrap();
        navigate('/');
      } catch (err) {
        // Error is handled in the slice
      }
    } else {
      // Registration validation
      if (!formData.email || !formData.password || !formData.name || !formData.username) {
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        dispatch(clearError());
        // You might want to set a local error state here
        return;
      }
      
      try {
        await dispatch(registerUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          username: formData.username,
        })).unwrap();
        
        // After successful registration, switch to login
        setIsLogin(true);
        setFormData({
          email: formData.email,
          password: '',
          confirmPassword: '',
          name: '',
          username: '',
        });
      } catch (err) {
        // Error is handled in the slice
      }
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@twitter.com',
      password: 'demo123',
      confirmPassword: '',
      name: '',
      username: '',
    });
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      username: '',
    });
    dispatch(clearError());
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="twitter-logo">
            <svg viewBox="0 0 24 24" className="twitter-icon">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
          <h1>{isLogin ? 'Sign in to Twitter' : 'Create your account'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign in' : 'Create account')}
          </button>

          {isLogin && (
            <div className="demo-login">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="demo-button"
              >
                Use Demo Account
              </button>
            </div>
          )}
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={switchMode} className="switch-mode-button">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="api-info">
          <div className="api-status">
            <span className="status-indicator"></span>
            <span>Connected to API Gateway</span>
          </div>
          <div className="api-details">
            <small>Secured with Apiman</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
