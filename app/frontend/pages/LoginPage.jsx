import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // For navigation
import AuthLayout from '../Layouts/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({}); // For client-side validation errors

  const { login, isLoadingAuth, authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoadingAuth) {
      navigate('/'); // Redirect to home or dashboard after successful login
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for the field as user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const success = await login(formData);
      if (success) {
        // Redirection handled by useEffect
        console.log('Login successful, redirecting...');
      } else {
        // Error message will be displayed by ErrorMessage component via authError
        console.log('Login failed.');
      }
    } else {
      console.log('Form validation failed.');
    }
  };

  return (
    <AuthLayout title="Welcome Back!">
      <div className="flex flex-col items-center">
        {isLoadingAuth && <LoadingSpinner size="md" className="mb-4" />}
        {authError && <ErrorMessage message={authError} type="error" className="mb-4" />}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <Input
            label="Email Address"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
            error={formErrors.email}
          />
          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            error={formErrors.password}
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-6"
            disabled={isLoadingAuth}
          >
            {isLoadingAuth ? 'Logging In...' : 'Login'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-gray-700">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline font-semibold">
            Sign Up
          </Link>
        </p>
        <p className="mt-3 text-sm text-gray-700">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
