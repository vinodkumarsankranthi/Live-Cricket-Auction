import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { baseURL } from "../../http";
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import './AuctionTeamPreview.css';
import { formatIndianNumber } from '../numberFormatter';

const AuctionTeamPreview = () => {
  const location = useLocation();
  const { auction_id } = location.state || {};

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/auction/${auction_id}/teams`);
      setTeams(response.data.teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      alert('Failed to fetch teams.');
    } finally {
      setLoading(false);
    }
  }, [auction_id]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  if (loading) {
    return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Loading Teams List...</p>
    </div>
  );
  }

  return (
    <div className="auctionteampreview-container">
      <div className="auctionteampreview-header">
        <button className="auctionteampreview-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="auctionteampreview-title">Auction Teams List</h2>
      </div>

      <div className="auctionteampreview-grid">
        {teams.length === 0 ? (
          <p>No teams found.</p>
        ) : (
          teams.map((team, index) => (
            <div key={team.id} className="auctionteampreview-card">
              <div className="auctionteampreview-serial">{index + 1}</div>

              <div className="auctionteampreview-logo-wrapper">
                <img
                  src={team.team_logo ? `http://localhost:8000${team.team_logo}` : '/default-logo.png'}
                  alt={team.team_name}
                  className="auctionteampreview-logo"
                />
              </div>

              <div className="auctionteampreview-info">
                <h3 className="auctionteampreview-name">
                  {team.team_name} ({team.team_short_name})
                </h3>
                <p><strong>Owner:</strong> {team.owner_name}</p>
                <p><strong>Contact:</strong> {team.owner_contact}</p>
                <p><strong>Amount Available:</strong> ₹ {formatIndianNumber(Math.floor(team.amount_available || 0))}</p>
                <p className="auctionteampreview-description"><strong>Details:</strong> {team.details}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuctionTeamPreview;
