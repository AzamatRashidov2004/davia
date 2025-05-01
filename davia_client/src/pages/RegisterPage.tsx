// davia_client/src/pages/RegisterPage.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import RegisterForm from '../auth/RegisterForm';

const RegisterPage: React.FC = () => {
  // Check if the user is already logged in
  const isLoggedIn = !!localStorage.getItem('token');
  
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;