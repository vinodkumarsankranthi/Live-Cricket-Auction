import { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import { baseURL } from "../../http";
import { FaArrowLeft } from "react-icons/fa";
import './AuctionPlayerPreview.css';
import { formatIndianNumber } from '../numberFormatter';

export default function PlayerListViewOnly() {
  const location = useLocation();
  const { auction_id } = location.state || {};
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchField, setSearchField] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await axios.get(`${baseURL}/players/${auction_id}`);
        setPlayers(res.data);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    const fetchTeams = async () => {
      try {
        const res = await axios.get(`${baseURL}/auction/${auction_id}/teams`);
        setTeams(res.data.teams);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchPlayers(), fetchTeams()]);
      setLoading(false);
    };

    fetchData();
  }, [auction_id]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFieldChange = (e) => {
    setSearchField(e.target.value);
    setSearchQuery('');
  };

  const getTeamShortName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.team_short_name : "Unknown Team";
  };

  const filteredPlayers = players.filter(player => {
    const query = searchQuery.toLowerCase();
    const playingStyle = player.playing_style?.toLowerCase() || '';
    const name = player.name?.toLowerCase() || '';

    if (searchField === 'batsman') return playingStyle === 'batsman' && name.includes(query);
    if (searchField === 'bowler') return playingStyle === 'bowler' && name.includes(query);
    if (searchField === 'allrounder') {
      return ['allrounder', 'all-rounder', 'all rounder'].includes(playingStyle) && name.includes(query);
    }
    if (searchField === 'sold') return player.sold_status === 'sold' && name.includes(query);
    if (searchField === 'unsold') return player.sold_status === 'unsold' && name.includes(query);
    if (searchField === 'unpicked') return (!player.sold_status || player.sold_status === '') && name.includes(query);
    if (searchField.startsWith('team_')) {
      const teamId = parseInt(searchField.split('_')[1]);
      return player.sold_team_id === teamId && name.includes(query);
    }
    return name.includes(query); // default
  });

  // Spinner component outside return
  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading Players List...</p>
      </div>
    );
  }

  return (
    <div className="AuctionPlayerPreview-container">
      <div className="AuctionPlayerPreview-header-container">
        <button className="AuctionPlayerPreview-back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="AuctionPlayerPreview-dashboard-title">Auction Players List</h2>
      </div>

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

      <div className="AuctionPlayerPreview-player-grid">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player, index) => (
            <div key={player.id} className="AuctionPlayerPreview-player-card">
              <div className="AuctionPlayerPreview-player-index">{index + 1}</div>

              <div className="AuctionPlayerPreview-player-left-column">
                <img
                  src={`http://localhost:8000/storage/${player.image}`}
                  alt={player.name}
                  className="AuctionPlayerPreview-player-image"
                />
                {player.sold_status === 'sold' && (
                  <img src="/sold1.png" alt="Sold" className="AuctionPlayerPreview-stamp-sold" />
                )}
                {player.sold_status === 'unsold' && (
                  <img src="/unsold1.png" alt="Unsold" className="AuctionPlayerPreview-stamp-unsold" />
                )}
              </div>

              <div className="AuctionPlayerPreview-player-info">
                <div className="AuctionPlayerPreview-player-name">{player.name}</div>

                <div className="AuctionPlayerPreview-player-attribute">
                  <p>Playing Style:</p>
                  <div>{player.playing_style}</div>
                </div>

                <div className="AuctionPlayerPreview-player-attribute">
                  <p>Batting Style:</p>
                  <div>{player.batting_style}</div>
                </div>

                <div className="AuctionPlayerPreview-player-attribute">
                  <p>Bowling Style:</p>
                  <div>{player.bowling_style}</div>
                </div>

                <div className="AuctionPlayerPreview-player-attribute">
                  <p>Base Bid:</p>
                  <div className="AuctionPlayerPreview-player-base">
                    ₹ {formatIndianNumber(Math.floor(player.base_price || 0))}
                  </div>
                </div>

                {player.sold_status === 'sold' && (
                  <div className="AuctionPlayerPreview-player-attribute">
                    <p>Sold To:</p>
                    <div className="AuctionPlayerPreview-player-base">
                      {getTeamShortName(player.sold_team_id)} - ₹ {formatIndianNumber(Math.floor(player.sold_price || 0))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="AuctionPlayerPreview-no-players-text">No players found in this Auction...</div>
        )}
      </div>
    </div>
  );
}
