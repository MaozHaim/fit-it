import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PersonalDetails from '../components/profile/PersonalDetails';
import SavedAddresses from '../components/profile/SavedAddresses';
import OrderHistory from '../components/profile/OrderHistory';

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/auth', { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-page">
      <h1>Hi, {user.firstName}!</h1>
      <PersonalDetails />
      <SavedAddresses userEmail={user.email} />
      <OrderHistory userEmail={user.email} />
      <div className="profile-signout">
        <button className="btn btn-secondary" onClick={handleSignOut}>Sign Out</button>
      </div>
    </div>
  );
}

export default ProfilePage;
