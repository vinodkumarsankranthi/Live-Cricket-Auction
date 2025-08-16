import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { baseURL } from "../../http";
import './My Auction.css';
import { FaEdit, FaTrash, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { IoIosPeople } from "react-icons/io";
import { BsMicrosoftTeams } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { customAlert } from "../SweetAlertCommon/Custom";  // Assuming this is your custom alert function
import { formatIndianNumber } from '../numberFormatter';
import { AuthContext } from '../../contexts/AuthContext';

const MyAuction = () => {
  const [auctions, setAuctions] = useState([]);
  const [searchField, setSearchField] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading } = useContext(AuthContext);  // Check if user is logged in
  const navigate = useNavigate();
  const [auctionsLoading, setAuctionsLoading] = useState(true);

  useEffect(() => {
    // Only fetch auctions if user is logged in and not loading
    if (user && !loading) {
      fetchAuctions();
    } else if (!user && !loading) {
      customAlert('Please Log In', 'You must be logged in to view your auctions.', 'error'); // Show alert if not logged in
      return(navigate(`/dashboard`));
    }
  }, [user, loading]);  // Fetch auctions only when user or loading changes

  const fetchAuctions = async () => {
  const token = localStorage.getItem('token');
  setAuctionsLoading(true);
  try {
    const response = await axios.get(`${baseURL}/my-auctions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setAuctions(response.data.auctions);
  } catch (error) {
    customAlert('Error', 'Failed to fetch auctions.', 'error');
  } finally {
    setAuctionsLoading(false);
  }
};


  const handleDelete = async (auctionId) => {
    try {
      await axios.delete(`${baseURL}/delete-auction/${auctionId}`);
      fetchAuctions();
      customAlert('Deleted!', 'Auction deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting auction:', error);
      customAlert('Error', 'Failed to delete auction.', 'error');
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

if (auctionsLoading) {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Loading Auctions...</p>
    </div>
  );
}
  return (
    <div className="MyAuction-container">
      <div className="MyAuction-header">
        <button className="MyAuction-back-btn" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="MyAuction-title">My Auctions</h1>
      </div>

      <div className="MyAuction-filter-bar">
        <select
          value={searchField}
          onChange={handleFieldChange}
          className="MyAuction-select-bar"
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
          className="MyAuction-search-bar"
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={!searchField}
        />
      </div>

      <div className="MyAuction-list">
        {filteredAuctions.length === 0 ? (
          <p>No auctions found  Please add auction</p>
        ) : (
          filteredAuctions.map((auction) => (
            <div key={auction.id} className="MyAuction-card">
              <div className="MyAuction-card-header">
                Auction Code : {auction.auction_code}
              </div>

              <div className="MyAuction-card-body">
                <img
                  src={auction.auction_logo || '/default-logo.png'}
                  alt={auction.auction_name}
                  className="MyAuction-logo"
                />
                <div>
                  <h3 className="MyAuction-name">{auction.auction_name}</h3>
                  <h3 className="MyAuction-name">➤ Season - {auction.auction_season}</h3>
                  <p className="MyAuction-date">
                   <FaCalendarAlt />{' '}{new Date(`${auction.auction_date}T${auction.auction_time}`).toLocaleString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                      }).replace(/am|pm/i, match => match.toUpperCase())}</p>
                 </div>
               </div>

              <div className="MyAuction-info">
                <div>
                  <p><strong>Points:</strong> ₹{formatIndianNumber(auction.points_per_team)}</p>
                  <p><strong>Base Bid:</strong> ₹{formatIndianNumber(auction.base_bid)}</p>
                </div>
                <div>
                  <p><strong>Bid Increase:</strong> ₹{formatIndianNumber(auction.bid_increase_by)}</p>
                  <p><BsMicrosoftTeams /> {formatIndianNumber(auction.max_players_per_team)}/Team</p>
                </div>
              </div>

              <div className="MyAuction-actions">
                <BsMicrosoftTeams className="MyAuction-teams-icon" title="Team" onClick={() => navigate('/auction/teams', { state: { auctionId: auction.id } })} />
                <IoIosPeople className="MyAuction-people-icon" title="Players" onClick={() => navigate('/auction/players', { state: { auctionId: auction.id } })} />
                <FaEdit className="MyAuction-edit-icon" title="Edit" onClick={() => navigate('/edit-auction', { state: { auctionId: auction.id } })} />
                <FaTrash className="MyAuction-delete-icon" title="Delete" onClick={() => handleDelete(auction.id)} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyAuction;
