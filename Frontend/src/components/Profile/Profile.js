import React, { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { customAlert } from '../SweetAlertCommon/Custom';
import { Navigate, useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    password: '',
    confirmPassword: '',
    oldPassword: '',
  });

  const [mode, setMode] = useState('view');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      return customAlert('Error', 'Passwords do not match', 'error');
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
    };

    if (formData.password) {
      payload.old_password = formData.oldPassword;
      payload.password = formData.password;
      payload.password_confirmation = formData.confirmPassword;
    }

    try {
      await updateUserProfile(payload);
      customAlert('Success', 'Profile updated successfully', 'success');
      setFormData({ ...formData, password: '', confirmPassword: '', oldPassword: '' });
      setMode('view');
    } catch (err) {
      customAlert('Error', err?.response?.data?.message || 'Could not update profile. Please try again later.', 'error');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || '',
      password: '',
      confirmPassword: '',
      oldPassword: '',
    });
    setMode('view');
  };

  const handleUpgrade = (plan) => {
    navigate('/pricing');
  };

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="profile-container">
      <h2 className="profile-heading">Welcome, {user.name} <div className="middle-line"></div></h2>
      <div className="profile-section-left">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
         <strong style={{ fontSize: '1.4rem', color: '#002244' }}>
           {user.role === 'admin' ? 'Admin Details' : 'User Details'}
         </strong>
       </div>
        <div className="profile-info-item"><i className="fas fa-user"></i><strong>Name:</strong> {user.name}</div>
        <div className="profile-info-item"><i className="fas fa-envelope"></i><strong>Email:</strong> {user.email}</div>
        <div className="profile-info-item"><i className="fas fa-phone"></i><strong>Phone:</strong> {user.phone}</div>
        <div className="profile-info-item"><i className="fas fa-city"></i><strong>City:</strong> {user.city}</div>
        <div className="profile-info-item"><i className="fas fa-gem"></i><strong>Plan:</strong> {user.plan}</div>
        <div className="profile-buttons">
          <button className="profile-btn profile-edit-btn" onClick={() => setMode('editDetails')}>Edit Profile</button>
          <button className="profile-btn profile-edit-btn" onClick={() => setMode('editPassword')}>Change Password</button>
        </div>
      </div>

      <div className="profile-section-right">
        {mode === 'view' && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <strong style={{ fontSize: '1.4rem', color: '#002244' }}>Upgrade Plan</strong>
          </div>
        )}
        {mode === 'editDetails' && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <strong style={{ fontSize: '1.4rem', color: '#002244' }}>Edit Details</strong>
          </div>
        )}
        {mode === 'editPassword' && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <strong style={{ fontSize: '1.4rem', color: '#002244' }}>Change Password</strong>
          </div>
        )}

        {mode === 'view' && (
          <div className="profile-upgrade-section-inline">
            {['bronze', 'silver', 'gold', 'platinum', 'premium', 'premium_Plus'].map((plan) => (
              <button
                key={plan}
                onClick={() => handleUpgrade(plan)}
                className={`plan-btn ${user.plan === plan ? 'current-plan' : ''}`}
                disabled={user.plan === plan}
              >
                {plan.charAt(0).toUpperCase() + plan.slice(1)} {user.plan === plan && '✔'}
              </button>
            ))}
          </div>
        )}

        {(mode === 'editDetails' || mode === 'editPassword') && (
          <form onSubmit={handleSaveChanges}>
            {mode === 'editDetails' && (
              <>
                {['name', 'email', 'phone', 'city'].map(field => (
                  <div className="form-floating" key={field}>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      name={field}
                      value={formData[field]}
                      onChange={handleInputChange}
                      placeholder=" "
                    />
                    <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  </div>
                ))}
              </>
            )}

            {mode === 'editPassword' && (
              <>
                <div className="form-floating">
                  <input type="password" name="oldPassword" value={formData.oldPassword} onChange={handleInputChange} placeholder=" " required/>
                  <label>Old Password</label>
                </div>
                <div className="form-floating">
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder=" " required/>
                  <label>New Password</label>
                </div>
                <div className="form-floating">
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder=" " required/>
                  <label>Confirm Password</label>
                </div>
              </>
            )}

            <div className="profile-buttons">
              <button type="submit" className="profile-btn profile-save-btn">Save</button>
              <button type="button" className="profile-btn profile-cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
