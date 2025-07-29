import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // For navigation
import AuthLayout from '../Layouts/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({}); // For client-side validation errors

  const { register, isLoadingAuth, authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoadingAuth) {
      navigate('/'); // Redirect to home or dashboard after successful signup
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
    if (!formData.username) {
      errors.username = 'Username is required.';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    }
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
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm Password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const success = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      if (success) {
        // Redirection handled by useEffect
        console.log('Registration successful, redirecting...');
      } else {
        // Error message will be displayed by ErrorMessage component via authError
        console.log('Registration failed.');
      }
    } else {
      console.log('Form validation failed.');
    }
  };

  return (
    <AuthLayout title="Create Your Account">
      <div className="flex flex-col items-center">
        {isLoadingAuth && <LoadingSpinner size="md" className="mb-4" />}
        {authError && <ErrorMessage message={authError} type="error" className="mb-4" />}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <Input
            label="Username"
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            required
            error={formErrors.username}
          />
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
            placeholder="Create a password"
            required
            error={formErrors.password}
          />
          <Input
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
            error={formErrors.confirmPassword}
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-6"
            disabled={isLoadingAuth}
          >
            {isLoadingAuth ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-gray-700">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
