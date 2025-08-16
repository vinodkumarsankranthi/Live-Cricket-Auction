import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { baseURL } from "../../http";
import './ContactUs.css';
import { customAlert } from '../SweetAlertCommon/Custom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const ContactUs = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    message: '',
    captchaInput: '',
  });

  const [phoneError, setPhoneError] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha());

  function generateCaptcha() {
    return Math.random().toString(36).substring(2, 8);
  }

  const handlePhoneChange = (phone, data) => {
    const formattedPhone = `+${data.dialCode}${phone.slice(data.dialCode.length)}`;
    const phoneNumber = parsePhoneNumberFromString(formattedPhone);

    if (phoneNumber && phoneNumber.isValid()) {
      setPhoneError('');
      setFormData(prev => ({ ...prev, mobile: formattedPhone }));
    } else {
      setPhoneError('Phone Number is Invalid.');
      setFormData(prev => ({ ...prev, mobile: formattedPhone }));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.captchaInput !== captcha) {
      customAlert("Error", "Captcha mismatch!", "error");
      return;
    }

    try {
      await axios.post(`${baseURL}/contact`, formData);
      customAlert("Success", "Mail sent successfully!", "success");

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        message: '',
        captchaInput: '',
      });

      setCaptcha(generateCaptcha());
    } catch (error) {
      customAlert("Error", "Error sending message. Please try again later.", "error");
    }
  };

  return (
    <div className="contactus-outer-container">
      <div className="contactus-header-container">
        <h2 className="contactus-title">CONTACT US</h2>
      </div>
      <div className="middle-line"></div>

      <div className="contactus-form-container">
        <form onSubmit={handleSubmit} className="contactus-form">
          {/* Row 1 */}
          <div className="form-row">
            <div className="form-column">
              <label>First Name</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter First Name"
                required
              />
            </div>
            <div className="form-column">
              <label>Last Name</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter Last Name"
                required
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="form-row">
            <div className="form-column">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                required
              />
            </div>
            <div className="form-column">
              <label>Mobile Number</label>
              <PhoneInput
                country={'in'}
                value={formData.mobile}
                onChange={handlePhoneChange}
                inputProps={{ name: 'mobile', required: true }}
              />
              {phoneError && (
                <div className="validation-message">{phoneError}</div>
              )}
            </div>
          </div>

          {/* Row 3 */}
          <div className="form-row captcha-row">
              <label>Captcha</label>
              <div className="captcha-container">
                <div className="contactus-captcha-box">{captcha}</div>
                <span
                  className="contactus-captcha-reload"
                  onClick={() => setCaptcha(generateCaptcha())}
                >
                  Reload
                </span>
              </div>
          <div className="form-column-small">
              <label>Enter Captcha</label>
              <input
                name="captchaInput"
                value={formData.captchaInput}
                onChange={handleChange}
                placeholder="Enter Captcha"
                required
              />
           </div>
          </div>

          {/* Row 4 */}
          <div className="form-row">
            <div className="form-column">
              <label>Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message"
                rows={4}
                required
              />
            </div>
          </div>

          <button type="submit" className="contactus-submit-button">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
