import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SignInForm from '../components/auth/SignInForm';
import RegisterForm from '../components/auth/RegisterForm';

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('signin');

  useEffect(() => {
    if (user) navigate('/profile', { replace: true });
  }, [user, navigate]);

  const handleSuccess = () => navigate('/profile');

  return (
    <div className="auth-page">
      <div className="auth-tabs">
        <button
          className={`auth-tab${activeTab === 'signin' ? ' active' : ''}`}
          onClick={() => setActiveTab('signin')}
          type="button"
        >
          Sign In
        </button>
        <button
          className={`auth-tab${activeTab === 'register' ? ' active' : ''}`}
          onClick={() => setActiveTab('register')}
          type="button"
        >
          Create Account
        </button>
      </div>

      {activeTab === 'signin'
        ? <SignInForm onSuccess={handleSuccess} />
        : <RegisterForm onSuccess={handleSuccess} />
      }
    </div>
  );
}

export default AuthPage;
