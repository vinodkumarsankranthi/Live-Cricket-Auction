import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { customAlert } from '../SweetAlertCommon/Custom';
import axios from 'axios';
import { baseURL } from "../../http";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import './LoginSignup.css';

const LoginSignup = () => {
  const { fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [step, setStep] = useState(1);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [phoneError, setPhoneError] = useState('');

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [signupOtp, setSignupOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [timer, setTimer] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingSendSignupOtp, setLoadingSendSignupOtp] = useState(false);
  const [loadingVerifySignup, setLoadingVerifySignup] = useState(false);
  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);
  const [loadingResetPassword, setLoadingResetPassword] = useState(false);


  const [signupStep, setSignupStep] = useState(1);
  const [showOtpNote, setShowOtpNote] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  useEffect(() => {
  let timeout;
  if (signupStep === 2) {
    setShowOtpNote(false); // reset when re-entering the step
    timeout = setTimeout(() => {
      setShowOtpNote(true);
    }, 60000); // 60 seconds
  }
  return () => clearTimeout(timeout); // cleanup
}, [signupStep]);


  const handlePhoneChange = (phone, data) => {
    const formattedPhone = `+${data.dialCode}${phone.slice(data.dialCode.length)}`;
    const phoneNumber = parsePhoneNumberFromString(formattedPhone);
    if (phoneNumber && phoneNumber.isValid()) {
      setPhoneError('');
      setSignupForm({ ...signupForm, phone: formattedPhone });
    } else {
      setPhoneError('Phone Number is Invalid.');
    }
  };

const handleLogin = async (e) => {
  e.preventDefault();
  setLoadingLogin(true);
  try {
    const res = await axios.post(`${baseURL}/login`, loginForm);
    localStorage.setItem('token', res.data.token);
    await fetchUser();

    if (res.data.user.role === 'admin') {
      customAlert('Success', 'Admin logged in successfully!', 'success');
      navigate('/admin-dashboard');
    } else {
      customAlert(`Welcome back, ${res.data.user.name}!`, 'You’ve successfully logged in.', 'success');
      navigate('/profile');
    }
  } catch (err) {
    customAlert('Login Failed', err.response?.data?.message || 'Error', 'error');
  } finally {
    setLoadingLogin(false);
  }
};

const handleSendSignupOtp = async (e) => {
  e.preventDefault();
  if (!signupForm.name || !signupForm.email || !signupForm.password || !signupForm.confirmPassword) {
    return customAlert('Error', 'Please fill all fields', 'error');
  }
  if (signupForm.password !== signupForm.confirmPassword) {
    return customAlert('Error', 'Passwords do not match', 'error');
  }
  if (!signupForm.phone || phoneError) {
    return customAlert('Error', 'Please enter a valid phone number.', 'error');
  }
  setLoadingSendSignupOtp(true);
  try {
    await axios.post(`${baseURL}/signup-send-otp`, { email: signupForm.email });
    customAlert('Success', `Verification code sent! Please check your email (${signupForm.email})`, 'success');
    setSignupStep(2);
  } catch (err) {
    customAlert('Error', err.response?.data?.message || 'Failed to send OTP', 'error');
  } finally {
    setLoadingSendSignupOtp(false);
  }
};

const handleVerifyAndRegister = async (e) => {
  e.preventDefault();
  setLoadingVerifySignup(true);
  try {
    const res = await axios.post(`${baseURL}/register`, {
      ...signupForm,
      otp: signupOtp
    });
    localStorage.setItem('token', res.data.token);
    await fetchUser();
    customAlert('Success', 'Registered successfully!', 'success');
    navigate('/profile');
  } catch (err) {
    customAlert('Signup Failed', err.response?.data?.message || 'Error', 'error');
  } finally {
    setLoadingVerifySignup(false);
  }
};

const handleSendOtp = async () => {
  if (loadingSendOtp) return;
  setLoadingSendOtp(true);
  try {
    await axios.post(`${baseURL}/send-otp`, { email: forgotEmail });
    customAlert('Success', 'OTP sent to your email', 'success');
    setTimer(60);
    setResendTimer(60);
    setStep(2);
  } catch (err) {
    customAlert('Error', err.response?.data?.message || 'Failed to send OTP', 'error');
  } finally {
    setLoadingSendOtp(false);
  }
};

const handleVerifyOtp = async () => {
  setLoadingVerifyOtp(true);
  try {
    await axios.post(`${baseURL}/verify-otp`, { email: forgotEmail, otp });
    customAlert('Success', 'OTP verified. Enter new password.', 'success');
    setStep(3);
  } catch (err) {
    customAlert('Error', err.response?.data?.message || 'Invalid OTP', 'error');
  } finally {
    setLoadingVerifyOtp(false);
  }
};

const handleResetPassword = async () => {
  setLoadingResetPassword(true);
  try {
    await axios.post(`${baseURL}/reset-password`, {
      email: forgotEmail,
      password: newPassword
    });
    customAlert('Success', 'Password reset successfully. Please log in.', 'success');
    setIsForgotPassword(false);
    setStep(1);
  } catch (err) {
    customAlert('Error', err.response?.data?.message || 'Failed to reset password', 'error');
  } finally {
    setLoadingResetPassword(false);
  }
};

   const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      await axios.post(`${baseURL}/send-otp`, { email: forgotEmail });
      customAlert('Success', 'OTP resent successfully', 'success');
      setResendTimer(60);
    } catch (err) {
      customAlert('Error', err.response?.data?.message || 'Failed to resend OTP', 'error');
    }
  };

  return (
    <div className="login-signup-container">
      <div className="form-card">
        <h2 className="form-heading">
          {isSignup ? 'Signup Form' : 'Login Form'}
        </h2>

        <div className="form-toggle">
          <button className={!isSignup ? 'active' : ''} onClick={() => {
            setIsSignup(false);
            setIsForgotPassword(false);
          }}>Login</button>
          <button className={isSignup ? 'active' : ''} onClick={() => {
            setIsSignup(true);
            setIsForgotPassword(false);
          }}>Signup</button>
        </div>

        <div className="middle-line"></div>

        {isSignup ? (
          signupStep === 1 ? (
            <form onSubmit={handleSendSignupOtp}>
              <input type="text" placeholder="Full Name" onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} required />
              <input type="email" placeholder="Email" onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} required />

              <div className="phone-input-container">
                <PhoneInput
                  country={'in'}
                  value={signupForm.phone}
                  onChange={handlePhoneChange}
                  required
                />
                {phoneError && (
                  <div style={{ color: 'red', fontSize: 'small', marginTop: '1px' }}>
                    {phoneError}
                  </div>
                )}
              </div>
        
              <div className="password-wrapper">
                <input type={showSignupPassword ? 'text' : 'password'} placeholder="Password" onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} required />
                <span onClick={() => setShowSignupPassword(!showSignupPassword)}>
                  {showSignupPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
        
              <div className="password-wrapper">
                <input type={showSignupConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} required />
                <span onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}>
                  {showSignupConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
        
              <button type="submit" className="submit-btn" disabled={loadingSendSignupOtp}>
                {loadingSendSignupOtp ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister}>
              <input type="text" placeholder="Check Gmail for OTP" onChange={(e) => setSignupOtp(e.target.value)} required />
                {showOtpNote && (
                  <small style={{ display: 'block', marginTop: '6px', color: '#004e92',  marginBottom: '6px', }}>
                    • OTP not received yet? Please check the email you entered. <strong>{signupForm.email}</strong>
                  </small>
                )}
              <div className="form-links">
                <a href="#" onClick={(e) => { e.preventDefault(); setSignupStep(1); }}>Back to Signup</a>
              </div>
              <button type="submit" className="submit-btn" disabled={loadingVerifySignup}>
                {loadingVerifySignup ? 'Verifying...' : 'Verify & Register'}
              </button>
            </form>
                  )
        ) : isForgotPassword ? (
          <div>
            {step === 1 && (
              <>
                <input type="email" placeholder="Enter Registered Email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                <button onClick={handleSendOtp} disabled={loadingSendOtp}>
                  {loadingSendOtp ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <input type="text" placeholder="Check Gmail for OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <button onClick={handleVerifyOtp} disabled={loadingVerifyOtp}>
                  {loadingVerifyOtp ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button onClick={handleResendOtp} disabled={resendTimer > 0} className="resend-btn">
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </>
            )}
            {step === 3 && (
              <>
                <div className="password-wrapper">
                  <input type={showNewPassword ? 'text' : 'password'} placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <span onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <button onClick={handleResetPassword} disabled={loadingResetPassword}>
                  {loadingResetPassword ? 'Resetting...' : 'Reset Password'}
                </button>
              </>
            )}
            <div className="form-links">
              <a href="#" onClick={() => setIsForgotPassword(false)}>Back to Login</a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email Address" onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
            <div className="password-wrapper">
              <input type={showLoginPassword ? 'text' : 'password'} placeholder="Password" onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
              <span onClick={() => setShowLoginPassword(!showLoginPassword)}>
                {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div className="form-links">
              <a href="#" onClick={() => setIsForgotPassword(true)}>Forgot password?</a>
            </div>
            <button type="submit" className="submit-btn" disabled={loadingLogin}>
              {loadingLogin ? 'Logging in...' : 'Login'}
            </button>
            <div className="form-footer">
              <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Don’t have an account?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(true); }}>Sign up</a>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;

