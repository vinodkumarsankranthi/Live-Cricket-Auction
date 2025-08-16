import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import { customAlert } from "../SweetAlertCommon/Custom";
import { baseURL } from "../../http";
import './Auction Panel.css';
import { AuthContext } from '../../contexts/AuthContext';

const AuctionPanel = () => {
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext); // Check login state
  const [loadingAuctions, setLoadingAuctions] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      fetchAuctions();
    } else if (!user && !loading) {
      customAlert('Please Log In', 'You must be logged in to view your auctions.', 'error');
      return navigate(`/dashboard`);
    }
  }, [user, loading]);

  const fetchAuctions = async () => {
  setLoadingAuctions(true);
  const token = localStorage.getItem('token');
  if (!token) {
    customAlert('Authentication Error', 'Missing token. Please log in again.', 'error');
    setLoadingAuctions(false);
    return;
  }

  try {
    const response = await axios.get(`${baseURL}/my-auctions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setAuctions(response.data.auctions);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    customAlert('Error', 'Failed to fetch auctions.', 'error');
  } finally {
    setLoadingAuctions(false);
  }
};


  const validateAuctionSetup = async (auctionId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${baseURL}/auction/${auctionId}/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.is_valid;
    } catch (error) {
      console.error('Validation error:', error);
      customAlert('Error', 'Unable to validate auction setup.', 'error');
      return false;
    }
  };

  const handleStartNewAuction = async (auction) => {
    const token = localStorage.getItem('token');

    // Combine auction_date and auction_time to a Date object
    const auctionDateTime = new Date(`${auction.auction_date}T${auction.auction_time}`);
    const now = new Date();

    if (now < auctionDateTime) {
      // Format date as requested
      const formattedDate = auctionDateTime.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).replace(/am|pm/i, match => match.toUpperCase());

      customAlert(
        'Too Early!',
        `This auction is scheduled for ${formattedDate}. You cannot start it before the scheduled time.`,
        'warning'
      );
      return;
    }

    const isValid = await validateAuctionSetup(auction.id);
    if (!isValid) {
      customAlert('Missing Data', 'Please add teams and players before entering the auction.', 'warning');
      return;
    }

    try {
      await axios.post(`${baseURL}/auction/${auction.id}/restart`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        
      });
      localStorage.removeItem(`auction_${auction.id}_ended`);
      localStorage.removeItem(`auction_${auction.id}_current_bid`);
      localStorage.removeItem(`auction_${auction.id}_selected_team_id`);
      localStorage.removeItem(`auction_${auction.id}_last_bid_team_id`);
      localStorage.removeItem(`auction_${auction.id}_players`);
      localStorage.removeItem(`auction_${auction.id}_teams`);
      localStorage.removeItem(`auction_${auction.id}_last_player_id`);

      navigate('/auction/info', { state: { auction_id: auction.id } });
    } catch (error) {
      console.error('Error restarting auction:', error);
      customAlert('Error', 'Failed to restart auction.', 'error');
    }
  };

  const handleContinueAuction = async (auctionId) => {
    const isValid = await validateAuctionSetup(auctionId);
    if (!isValid) {
      customAlert('Missing Data', 'Please add teams and players before entering the auction.', 'warning');
      return;
    }
    navigate('/auction/live', { state: { auction_id: auctionId } });
  };

  if (loadingAuctions) {
  return (
    <div className="spinner-container"> 
      <div className="spinner"></div> 
        <p>Loading Auction Panels...</p>
    </div>
  );
}
  return (
    <div className="auction-panel-container">
      <div className="auction-panel-header">
        <button className="all-back-button" onClick={() => navigate('/dashboard')}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="auction-panel-title">Auction Panel</h2>
      </div>

      <div className="auction-panel-card-wrapper">
  {auctions.length === 0 ? (
    <div className="MyAuction-list">
       <p>No auctions found  Please add auction</p>
    </div>
  ) : (
    auctions.map((auction) => (
      <div key={auction.id} className="auction-panel-card">
        <img
          src={auction.auction_logo || '/default-logo.png'}
          alt={auction.auction_name}
          className="auction-panel-logo"
        />
        <h3 className="auction-panel-name">{auction.auction_name}</h3>
        <p className="auction-panel-date">
          <FaCalendarAlt />{' '}
          {new Date(`${auction.auction_date}T${auction.auction_time}`).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }).replace(/am|pm/i, match => match.toUpperCase())}
        </p>
        <span className="auction-panel-code">Auction Code : {auction.auction_code}</span>

        <div className="auction-panel-button-group">
          {auction.can_continue && (
            <button
              className="auction-panel-btn auction-panel-continue-btn"
              onClick={() => handleContinueAuction(auction.id)}
            >
              {localStorage.getItem(`auction_${auction.id}_ended`) === 'true' ? 'View Auction' : 'Continue Auction'}
            </button>
          )}
          <button
            className="auction-panel-btn auction-panel-start-btn"
            onClick={() => handleStartNewAuction(auction)}
          >
            Start New Auction
          </button>
        </div>
      </div>
    ))
  )}
</div>

    </div>
  );
};

export default AuctionPanel;
