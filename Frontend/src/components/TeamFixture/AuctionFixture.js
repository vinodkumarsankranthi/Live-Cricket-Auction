import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from "../../http";
import { FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { customAlert } from "../SweetAlertCommon/Custom";
import './AuctionFixture.css';

const AuctionFixture = () => {
  const [auctions, setAuctions] = useState([]);
  const [searchField, setSearchField] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);  // <-- Loading state added
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      customAlert('Please Log In', 'You must be logged in to view auction fixtures.', 'error');
      navigate(`/dashboard`);
      return;
    }
    fetchAuctions(token);
  }, []);

  const fetchAuctions = async (token) => {
    setLoading(true); // Start loading before request
    try {
      const response = await axios.get(`${baseURL}/my-auctions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAuctions(response.data.auctions);
    } catch (error) {
      customAlert('Error', 'Failed to fetch auctions.', 'error');
    } finally {
      setLoading(false); // Stop loading after request completes
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFieldChange = (e) => {
    setSearchField(e.target.value);
    setSearchQuery('');
  };

  const filteredAuctions = auctions.filter((auction) => {
    if (!searchField) return true;
    const value = auction[searchField]?.toString().toLowerCase();
    return value && value.includes(searchQuery.toLowerCase());
  });

  if (loading) {
  return (
    <div className="spinner-container"> 
      <div className="spinner"></div> 
        <p>Loading Team Fixtures...</p>
    </div>
  );
}

  return (
    <div className="AuctionFixture-container">
      <div className="AuctionFixture-header">
        <button className="AuctionFixture-back-btn" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="AuctionFixture-title">Team Fixtures</h1>
      </div>

      <div className="AuctionFixture-filter-bar">
        <select
          value={searchField}
          onChange={handleFieldChange}
          className="AuctionFixture-select-bar"
        >
          <option value="" disabled>Select Category ↓</option>
          <option value="auction_name">Auction Name</option>
          <option value="auction_date">Auction Date</option>
          <option value="auction_time">Auction Time</option>
          <option value="points_per_team">Points Per Team</option>
          <option value="base_bid">Base Bid</option>
          <option value="bid_increase_by">Bid Increase</option>
          <option value="max_players_per_team">Max Players Per Team</option>
        </select>
        <input
          type="text"
          placeholder="Search..."
          className="AuctionFixture-search-bar"
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={!searchField}
        />
      </div>

      <div className="AuctionFixture-list">
        {filteredAuctions.length === 0 ? (
          <p>No auctions found.</p>
        ) : (
          filteredAuctions.map((auction) => (
            <div
              key={auction.id}
              className="AuctionFixture-card"
              onClick={async () => {
                try {
                  const res = await axios.get(`${baseURL}/auction/${auction.id}/teams`);
                  if (res.data.teams && res.data.teams.length > 0) {
                    navigate('/auction/team-fixture', { state: { auctionId: auction.id } });
                  } else {
                    customAlert('Missing Data', 'Please add teams in Auction before entering the Team Fixture.', 'warning');
                  }
                } catch (error) {
                  console.error("Failed to check teams:", error);
                  customAlert('Error', 'Could not verify team data. Please try again.', 'error');
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="AuctionFixture-card-body">
                <img
                  src={auction.auction_logo || '/default-logo.png'}
                  alt={auction.auction_name}
                  className="AuctionFixture-logo"
                />
                <div>
                  <h3 className="AuctionFixture-name">{auction.auction_name}</h3>
                  <p className="AuctionFixture-date"><FaCalendarAlt />{' '}{new Date(`${auction.auction_date}T${auction.auction_time}`).toLocaleString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }).replace(/am|pm/i, match => match.toUpperCase())}</p>
                  <p className="AuctionFixture-date">Auction Code : {auction.auction_code}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuctionFixture;
