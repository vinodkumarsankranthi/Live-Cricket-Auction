import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
 import { baseURL } from "../../http";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import './PlayersList.css';
import { customAlert } from "../SweetAlertCommon/Custom";
import { formatIndianNumber } from '../numberFormatter';

export default function PlayerList() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchField, setSearchField] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { state } = useLocation();
  const auctionId = state?.auctionId;

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await axios.get(`${baseURL}/players/${auctionId}`);
        setPlayers(res.data);
      } catch (error) {
        console.error('Error fetching players:', error);
        customAlert('Error', 'Failed to fetch players.', 'error');
      }
    };

    const fetchTeams = async () => {
      try {
        const res = await axios.get(`${baseURL}/auction/${auctionId}/teams`);
        setTeams(res.data.teams);
      } catch (error) {
        console.error('Error fetching teams:', error);
        customAlert('Error', 'Failed to fetch teams.', 'error');
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchPlayers(), fetchTeams()]);
      setLoading(false);
    };

    fetchData();
 }, [auctionId]);

 const handleEdit = (id) => {
  navigate(`/auction/players/edit`, { state: { playerId: id, auctionId } });
};
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseURL}/players/delete/${id}`);
      setPlayers(players.filter(player => player.id !== id));
      customAlert('Deleted!', 'Player deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting player:', error);
      customAlert('Error', 'Failed to delete player.', 'error');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFieldChange = (e) => {
    setSearchField(e.target.value);
    setSearchQuery(''); // clear search input when field changes
  };

  const getTeamShortName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.team_short_name : "Unknown Team";
  };

  const filteredPlayers = players.filter(player => {
    const query = searchQuery.toLowerCase();
    const playingStyle = player.playing_style?.toLowerCase() || '';
    const name = player.name?.toLowerCase() || '';

    if (searchField === 'batsman') {
      return playingStyle === 'batsman' && name.includes(query);
    } else if (searchField === 'bowler') {
      return playingStyle === 'bowler' && name.includes(query);
    } else if (searchField === 'allrounder') {
      return (
        (playingStyle === 'allrounder' || playingStyle === 'all-rounder' || playingStyle === 'all rounder') &&
        name.includes(query)
      );
    } else if (searchField === 'sold') {
      return player.sold_status === 'sold' && name.includes(query);
    } else if (searchField === 'unsold') {
      return player.sold_status === 'unsold' && name.includes(query);
    } else if (searchField === 'unpicked') {
      return (!player.sold_status || player.sold_status === '') && name.includes(query);
    } else if (searchField.startsWith('team_')) {
      const teamId = parseInt(searchField.split('_')[1]);
      return player.sold_team_id === teamId && name.includes(query);
    } else if (searchField === 'name') {
      return name.includes(query);
    } else {
      return name.includes(query); // default search by name
    }
  });

 if (loading) {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Loading Players List...</p>
    </div>
  );
}

  return (
    <div className="PlayersList-container">
      <div className="PlayersList-header-container">
        <button className="PlayersList-back-button" onClick={() => navigate("/my-auction")}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="PlayersList-dashboard-title">Players List</h2>
        <button className="PlayersList-add-button" onClick={() => navigate(`/auction/players/add`, { state: { auctionId } })}>
          + Add
        </button>
      </div>

      {/* Search & Filter */}
      <div className="PlayersList-filter-bar">
        <div className="PlayersList-dropdown-new">
          <select
            id="searchField"
            value={searchField}
            onChange={handleFieldChange}
            className="PlayersList-select-bar"
          >
            <option value="" disabled>Select Category ↓</option>
            <option value="name">Player Name</option>
            <option value="batsman">Batsmans</option>
            <option value="bowler">Bowlers</option>
            <option value="allrounder">All-Rounders</option>
            <option value="sold">Sold Players</option>
            <option value="unsold">Unsold Players</option>
            <option value="unpicked">Unpicked Players</option>
            {teams.map(team => (
              <option key={team.id} value={`team_${team.id}`}>
                {team.team_short_name} Players
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Search by player name..."
          className="PlayersList-search-bar"
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={searchField === ''}
        />
      </div>

      <div className="teamslist">
        {filteredPlayers.length === 0 ? (
          <p>No Players found Please add Players</p>
        ) : (
        <div className="player-grid">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player, index) => (
              <div key={player.id} className="player-card">
                <div className="player-index">{index + 1}</div>

                <div className="player-left-column">
                  <img
                    src={`http://localhost:8000/storage/${player.image}`}
                    alt={player.name}
                    className="player-image"
                  />
                  {player.sold_status === 'sold' && (
                    <img src="/sold1.png" alt="Sold" className="statusonp-stamp1" />
                  )}
                  {player.sold_status === 'unsold' && (
                    <img src="/unsold1.png" alt="Unsold" className="statusonp-stamp2" />
                  )}
                  <div className="player-actions-row">
                    <div title="Edit Player" className="action-icon edit" onClick={() => handleEdit(player.id)}>
                      <FaEdit />
                    </div>
                    <div title="Delete Player" className="action-icon delete" onClick={() => handleDelete(player.id)}>
                      <FaTrash />
                    </div>
                  </div>
                </div>

                <div className="player-info">
                  <div className="player-name">{player.name}</div>

                  <div className="player-actions-style">
                    <p>Playing Style :</p>
                    <div className="player-style">{player.playing_style}</div>
                  </div>

                  <div className="player-actions-style">
                    <p>Batting Style :</p>
                    <div className="player-style">{player.batting_style}</div>
                  </div>

                  <div className="player-actions-style">
                    <p>Bowling Style :</p>
                    <div className="player-style">{player.bowling_style}</div>
                  </div>

                  <div className="player-actions-style">
                    <p>Base Bid :</p>
                    <div className="player-base">
                      ₹ {formatIndianNumber(Math.floor(player.base_price || 0))}
                    </div>
                  </div>

                  {player.sold_status === 'sold' && (
                    <div className="player-actions-style">
                      <p>Sold To :</p>
                      <div className="player-base">
                        {getTeamShortName(player.sold_team_id)} - ₹ {formatIndianNumber(Math.floor(player.sold_price || 0))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-players-text">No players found Please add players.</div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
