import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
 import { baseURL } from "../../http";
import { FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import './TeamsList.css';
import { customAlert } from "../SweetAlertCommon/Custom";
import { formatIndianNumber } from '../numberFormatter'; 

const TeamsList = () => {
  const [teams, setTeams] = useState([]);
  const [searchField, setSearchField] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { state } = useLocation();
  const auctionId = state?.auctionId;
  const [loading, setLoading] = useState(true);

 const fetchTeams = useCallback(async () => {
  setLoading(true);
  try {
    const response = await axios.get(`${baseURL}/auction/${auctionId}/teams`);
    setTeams(response.data.teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    customAlert('Error', 'Failed to fetch teams.', 'error');
  } finally {
    setLoading(false);
  }
}, [auctionId]);

  useEffect(() => {
  if (auctionId) {
    fetchTeams();
  }
}, [auctionId, fetchTeams]);


  const handleEdit = (team_id) => {
    navigate('/auction/teams/edit', { state: { auctionId, teamId: team_id } });
  };

  const handleDeleteConfirm = async (team_id) => {
    try {
      await axios.delete(`${baseURL}/auction/${auctionId}/teams/${team_id}/delete`);
      await fetchTeams();
      customAlert('Deleted!', 'Team deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting team:', error);
      customAlert('Error', 'Failed to delete team.', 'error');
    }
  };

  const handleFieldChange = (e) => {
    setSearchField(e.target.value);
    setSearchQuery('');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredTeams = teams.filter((team) => {
    if (!searchField) return true;
    let value = team[searchField];

    if (searchField === 'amount_available') {
      value = team.amount_available?.toString();
    } else {
      value = value?.toString().toLowerCase();
    }

    return value && value.includes(searchQuery.toLowerCase());
  });

  if (loading) {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Loading Teams List...</p>
    </div>
  );
}

  return (
    <div className="teamslist-container">
      <div className="teamslist-header">
        <button className="teamslist-back-btn" onClick={() => navigate("/my-auction")}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="teamslist-title">Auction Teams</h2>
        <button className="teamslist-add-btn"onClick={() => navigate("/auction/teams/add", { state: { auctionId } })}>
          + Add
        </button>
      </div>

      <div className="teamslist-filter-bar">
        <select
          id="searchField"
          value={searchField}
          onChange={handleFieldChange}
          className="teamslist-select-bar"
        >
          <option value="" disabled>Select Category ↓</option>
          <option value="team_name">Team Name</option>
          <option value="owner_name">Owner Name</option>
          <option value="owner_contact">Contact</option>
          <option value="amount_available">Amount Available</option>
        </select>

        <input
          type="text"
          className="teamslist-search-bar"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={!searchField}
        />
      </div>
     
      <div className="teamslist-grid">
        {filteredTeams.length === 0 ? (
          <p>No teams found Please add teams</p>
        ) : (
          filteredTeams.map((team, index) => (
            <div key={team.id} className="teamslist-card">
              <div className="teamslist-serial">{index + 1}</div>

              <div className="teamslist-logo-wrapper">
                <img
                  src={team.team_logo ? `http://localhost:8000${team.team_logo}` : '/default-logo.png'}
                  alt={team.team_name}
                  className="teamslist-logo"
                />
              </div>

              <div className="teamslist-info">
                <h3 className="teamslist-name">{team.team_name} ({team.team_short_name})</h3>
                <p><strong>Owner:</strong> {team.owner_name}</p>
                <p><strong>Contact:</strong> {team.owner_contact}</p>
                <p><strong>Amount Available:</strong> ₹ {formatIndianNumber(Math.floor(team.amount_available || 0))}</p>
                <p className="teamslist-description"><strong>Details:</strong> {team.details}</p>
              </div>

              <div className="teamslist-btn-group">
                <button className="teamslist-edit-btn" onClick={() => handleEdit(team.id)}>Edit</button>
                <button className="teamslist-delete-btn" onClick={() => handleDeleteConfirm(team.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamsList;
