// src/pages/LoginPage.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '../auth/LoginForm';

const LoginPage: React.FC = () => {
  // Check if the user is already logged in
  const isLoggedIn = !!localStorage.getItem('token');
  
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;