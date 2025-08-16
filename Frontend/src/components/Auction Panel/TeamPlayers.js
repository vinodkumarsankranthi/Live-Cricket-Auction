import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { formatIndianNumber } from '../numberFormatter';
import { customAlert } from "../SweetAlertCommon/Custom";
import { baseURL } from "../../http";
import './TeamPlayer.css';

const TeamPlayers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auction_id = location.state?.auction_id;
  const teamId = location.state?.teamId;
  const [players, setPlayers] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [searchField, setSearchField] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (!auction_id) {
    customAlert("Missing Auction ID", "Auction ID was not provided. Redirecting back.", "error");
    navigate('/auction-panel');
  }
}, [auction_id],teamId);


  useEffect(() => {
    fetchTeamPlayers();
  }, []);

  const fetchTeamPlayers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseURL}/auction/${auction_id}/team/${teamId}/players`);
      setPlayers(res.data.players);
      setTeamName(res.data.team_name);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
    setLoading(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFieldChange = (e) => {
    setSearchField(e.target.value);
    setSearchQuery('');
  };

  const filteredPlayers = players.filter(player => {
    const query = searchQuery.toLowerCase();
    const playingStyle = player.playing_style?.toLowerCase() || '';
    const name = player.name?.toLowerCase() || '';
    const basePrice = player.base_price?.toString() || '';
    const soldPrice = player.sold_price?.toString() || '';

    if (searchField === 'batsman') {
      return playingStyle === 'batsman' && name.includes(query);
    } else if (searchField === 'bowler') {
      return playingStyle === 'bowler' && name.includes(query);
    } else if (searchField === 'allrounder') {
      return (playingStyle === 'allrounder' || playingStyle === 'all-rounder' || playingStyle === 'all rounder') && name.includes(query);
    } else if (searchField === 'name') {
      return name.includes(query);
    } else if (searchField === 'base_price') {
      return basePrice.includes(query);
    } else if (searchField === 'sold_price') {
      return soldPrice.includes(query);
    } else {
      return true; // No filter selected
    }
  });

  if (loading) {
     return (
    <div className="spinner-container"> 
      <div className="spinner"></div> 
        <p>Loading Team Players...</p>
    </div>
  );
  }

  return (
    <div className="teamplayer-container">
      <div className="teamplayer-header">
        <button className="all-back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="all-auction-title">{teamName} - Players</h2>
      </div>

      <div className="teamplayer-filter-bar">
        <div className="teamplayer-dropdown-bar">
          <select
            id="searchField"
            value={searchField}
            onChange={handleFieldChange}
            className="teamplayer-select-bar"
          >
            <option value="">Select Category ↓</option>
            <option value="name">Name</option>
            <option value="batsman">Batsman</option>
            <option value="bowler">Bowler</option>
            <option value="allrounder">All-Rounder</option>
            <option value="base_price">Base Price</option>
            <option value="sold_price">Sold Price</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Search..."
          className="teamplayer-search-bar"
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={!searchField}
        />
      </div>

      {loading ? (
        <h3>Loading players...</h3>
      ) : (
        <div className="player-grid">
          {filteredPlayers.length ? (
            filteredPlayers.map((player, index) => (
              <div key={player.id} className="player-card">
                <div className="player-index">{index + 1}</div>
                <div className="team-player-left-column-new">
                  <img
                    src={`http://localhost:8000/storage/${player.image}`}
                    alt={player.name}
                    className="team-player-image-new"
                  />
                  {player.sold_status === 'sold' && (
                    <img src="/sold1.png" alt="Sold" className="statusonp-stamp1" />
                  )}
                  {player.sold_status === 'unsold' && (
                    <img src="/unsold1.png" alt="Unsold" className="statusonp-stamp2" />
                  )}
                </div>

                <div className="player-info">
                  <div className="player-name">{player.name}</div>

                  <div className="player-actions-style">
                    <p>Playing Style :</p>
                    <div className="player-style">{player.playing_style}</div>
                  </div>

                  <div className="player-actions-style">
                    <p>Base Price :</p>
                    <div className="player-style">₹ {formatIndianNumber(player.base_price)}</div>
                  </div>

                  <div className="player-actions-base">
                    <p>Sold Price :</p>
                    <div className="team-player-base-new">
                      ₹ {player.sold_price ? formatIndianNumber(player.sold_price) : '0'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <h3>No players found.</h3>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamPlayers;
