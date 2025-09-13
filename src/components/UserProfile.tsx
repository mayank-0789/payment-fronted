import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { currentUser, logout, isPaidUser, paymentLoading } = useAuth();

  const profileStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'white',
    padding: '8px 16px',
    borderRadius: '25px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0'
  };

  const avatarStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover' as const
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    margin: 0
  };

  const logoutButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '12px',
    textDecoration: 'underline',
    padding: 0
  };

  const paidBadgeStyle: React.CSSProperties = {
    fontSize: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '10px',
    marginLeft: '4px',
    fontWeight: 'bold'
  };

  const loadingStyle: React.CSSProperties = {
    fontSize: '10px',
    color: '#666',
    fontStyle: 'italic'
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!currentUser) return null;

  return (
    <div style={profileStyle}>
      {currentUser.photoURL && (
        <img
          src={currentUser.photoURL}
          alt="Profile"
          style={avatarStyle}
        />
      )}
      <div>
        <p style={nameStyle}>
          {currentUser.displayName}
          {paymentLoading && <span style={loadingStyle}> (checking...)</span>}
          {!paymentLoading && isPaidUser && <span style={paidBadgeStyle}>PAID</span>}
        </p>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          Sign out
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
