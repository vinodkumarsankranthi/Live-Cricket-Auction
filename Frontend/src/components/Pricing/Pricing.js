import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pricing.css';

const planKeys = ['bronze', 'silver', 'gold', 'platinum', 'premium', 'premium_Plus'];

export const planDetails = {
  bronze: { price: 'Free', teams: '2', color: 'green', themes: '1', label: 'Bronze', tag: 'Starter' },
  silver: { price: '₹499', teams: '4', color: 'yellow', themes: '5', label: 'Silver', tag: 'Basic' },
  gold: { price: '₹999', teams: '7', color: 'orange', themes: '8', label: 'Gold', tag: 'Growth' },
  platinum: { price: '₹1499', teams: '12', color: 'blue', themes: '12', label: 'Platinum', tag: 'Pro' },
  premium: { price: '₹2999', teams: '18', color: 'purple', themes: '15', label: 'Premium', tag: 'Business' },
  premium_Plus: { price: '₹4999', teams: '∞', color: 'red', themes: '∞', label: 'Premium Plus', tag: 'Enterprise' },
};

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  const handleCardClick = (key) => {
    if (key !== 'bronze') {
      setSelectedPlan(key);
    }
  };

  const closeModal = () => setSelectedPlan(null);

  const renderModal = () => {
    if (!selectedPlan) return null;
    const plan = planDetails[selectedPlan];

return (
  <div className="pricing-modal-overlay" onClick={closeModal}>
    <div className={`pricing-modal-content ${plan.color}`}onClick={(e) => e.stopPropagation()}>
      <div className="pricing-modal-header">
        <h2 className="pricing-modal-title">Payment Method</h2>
      </div>
      <div className="pricing-modal-middle-line"></div>
      <div className="pricing-payment-box">

        <div className="pricing-row pricing-plan-row">
          <h3>Selected Plan : <strong>{plan.label}</strong></h3>
          <p><strong>Amount :</strong> {plan.price}</p>
          <p><strong>What you get :</strong> {plan.teams} Teams and {plan.themes} Themes</p>
        </div>

        <hr />

        <div className="pricing-row pricing-details-row">
          <div className="pricing-col">
            <h3><strong>Bank Account</strong></h3>
            <p><strong>Account Name :</strong> Live Cricket Auction</p>
            <p><strong>Account Number :</strong> 123456789012</p>
            <p><strong>Bank :</strong>Add Bank Account</p>
            <p><strong>Branch :</strong> Add Branch</p>
            <p><strong>IFSC Code :</strong> Add IFSC Code</p>
          </div>
             <div className="vertical-divider"></div>
          <div className="pricing-col">
            <h3><strong>UPI (GPay, PhonePe, PayTM)</strong></h3>
            <img src="/qrcode.png" alt="QR Code" className="pricing-qr-code" />
            <p><strong>UPI :</strong> addanyupi@hdfc</p>
            <p>Share receipt on WhatsApp - <strong style={{ color: '#00c853' }}>1234567890</strong></p>
          </div>
        </div>
      </div>
      
      <div className="pricing-modal-actions">
          <button className="pricing-close-btn" onClick={closeModal}>Close</button>
          <button className="pricing-contact-btn" onClick={() => {
            closeModal();
            navigate('/contact');
          }}>
            Contact Us
          </button>
        </div>
    </div>
  </div>
);
};

  return (
    <div className="pricing-container">
      <h2 className="pricing-title">Available Plans</h2>
      <div className="middle-line"></div>
      <div className="pricing-cards">
        {planKeys.map((key) => {
          const plan = planDetails[key];
          return (
            <div
              key={key}
              className={`pricing-card ${plan.color}`}
              onClick={() => handleCardClick(key)}
              style={{ cursor: key !== 'bronze' ? 'pointer' : 'default' }}
            >
              <div className="card-header-polygon">
                <h3>{plan.label}</h3>
              </div>
              <div className="card-body">
                <div className="price-circle">
                  {plan.price !== 'Free' && <span>Rs.</span>}
                  <span>{plan.price}</span>
                </div>
                <p>Includes up to</p>
                <div className="info-line">
                  <span className="text-label">► </span>
                  <span className="teams">{plan.teams}</span>
                  <span className="text-label"> Teams</span>
                </div>
                <div className="info-line">
                  <span className="text-label">► Get</span>
                  <span className="teams">{plan.themes}</span>
                  <span className="text-label"> Auction Themes free</span>
                </div>
              </div>
              <div className="card-footer">
                <p>Per Auction</p>
              </div>
            </div>
          );
        })}
      </div>
      {renderModal()}
    </div>
  );
};

export default Pricing;
