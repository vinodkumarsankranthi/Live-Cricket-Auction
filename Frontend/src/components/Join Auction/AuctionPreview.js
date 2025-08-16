import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { baseURL } from "../../http";
import './AuctionPreview.css';
import { customAlert } from "../SweetAlertCommon/Custom"; 

const AuctionPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auction_id = location.state?.auction_id;

  const [auctionDetails, setAuctionDetails] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]); 
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [filterType, setFilterType] = useState('serial');
  const [backgroundKey, setBackgroundKey] = useState('auctionbg1');

  const totalPlayers = allPlayers.length;
  const soldPlayers = allPlayers.filter(p => p.sold_status === 'sold').length;
  const unsoldPlayers = allPlayers.filter(p => p.sold_status === 'unsold').length;

const backgrounds = {
    auctionbg1: '/auctionbg1.png',
    auctionbg2: '/auctionbg2.png',
    auctionbg3: '/auctionbg3.png',
    auctionbg4: '/auctionbg4.png',
    auctionbg5: '/auctionbg5.png',
    auctionbg6: '/auctionbg6.png',
    auctionbg7: '/auctionbg7.png',
    auctionbg8: '/auctionbg8.png',
    auctionbg9: '/auctionbg9.png',
    auctionbg10: '/auctionbg10.png',
    auctionbg11: '/auctionbg11.png',
    auctionbg12: '/auctionbg12.png',
  };

  const backgroundThemeMap = {
    auctionbg1: 'theme1',
    auctionbg2: 'theme2',
    auctionbg3: 'theme3',
    auctionbg4: 'theme4',
    auctionbg5: 'theme5',
    auctionbg6: 'theme6',
    auctionbg7: 'theme7',
    auctionbg8: 'theme8',
    auctionbg9: 'theme9',
    auctionbg10: 'theme10',
    auctionbg11: 'theme11',
    auctionbg12: 'theme12',
  };

  const backgroundTextColors = {
    theme1: {
      playerName: '#ffffff',
      playerRole: '#ffffff',
      playerInfo: '#16213e',
    },
    theme2: {
      playerName: '#16213e',
      playerRole: '#16213e',
      playerInfo: '#ffffff',
    },
    theme3: {
      playerName: '#ffa500',
      playerRole: '#ffa500',
      playerInfo: '#ffffff',
    },
    theme4: {
      playerName: '#16213e',
      playerRole: '#16213e',
      playerInfo: '#ffffff',
    },
    theme5: {
      playerName: '#ffa500',
      playerRole: '#ffa500',
      playerInfo: '#ffffff',
    },
    theme6: {
      playerName: '#ffa500',
      playerRole: '#ffa500',
      playerInfo: '#16213e',
    },
    theme7: {
      playerName: '#ffa500',
      playerRole: '#ffa500',
      playerInfo: '#16213e',
    },
    theme8: {
      playerName: '#ffffff',
      playerRole: '#ffffff',
      playerInfo: '#ffffff',
    },
    theme9: {
      playerName: '#ffa500',
      playerRole: '#ffa500',
      playerInfo: '#ffffff',
    },
    theme10: {
      playerName: '#ffa500',
      playerRole: '#ffa500',
      playerInfo: '#ffffff',
    },
    theme11: {
      playerName: '#ffa500',
      playerRole: '#ffa500',
      playerInfo: '#ffffff',
    },
    theme12: {
      playerName: '#ffa500',
      playerRole: '#ffa500',
      playerInfo: '#ffffff',
    },
  };

  const initialBackground = localStorage.getItem(`selectedBackground_${auction_id}`) || 'auctionbg1';
  const initialTheme = backgroundThemeMap[initialBackground];
  const [textColors, setTextColors] = useState(backgroundTextColors[initialTheme]);


  // Redirect back if no auction_id
  useEffect(() => {
    if (!auction_id) {
      navigate(-1);
    }
  }, [auction_id, navigate]);

  // Load background key from localStorage based on auction_id
  useEffect(() => {
    if (auction_id) {
      const storedBg = localStorage.getItem(`selectedBackground_${auction_id}`);
      if (storedBg && backgrounds[storedBg]) {
        setBackgroundKey(storedBg);
      }
    }
  }, [auction_id]);

  // Fetch auction details, players, teams
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auctionRes, playersRes, teamsRes] = await Promise.all([
          axios.get(`${baseURL}/auction/${auction_id}`),
          axios.get(`${baseURL}/players/${auction_id}`),
          axios.get(`${baseURL}/auction/${auction_id}/teams`)
        ]);

        const allFetchedPlayers = playersRes.data;

        setAuctionDetails(auctionRes.data.auction);
        setAllPlayers(allFetchedPlayers);
        setPlayers(allFetchedPlayers);
        setTeams(teamsRes.data.teams);
      } catch (error) {
        customAlert('Error', 'Failed to fetch auction data.', 'error');
      }
    };

    fetchData();
  }, [auction_id]);

  // Apply filters to player list
  const applyFilter = (type) => {
    let filtered = [];

    switch (type) {
      case 'serial':
        filtered = [...allPlayers];
        break;
      case 'sold':
        filtered = allPlayers.filter(p => p.sold_status === 'sold');
        break;
      case 'unsold':
        filtered = allPlayers.filter(p => p.sold_status === 'unsold');
        break;
      case 'batters':
        filtered = allPlayers.filter(p => p.playing_style?.toLowerCase().includes('bat'));
        break;
      case 'bowlers':
        filtered = allPlayers.filter(p => p.playing_style?.toLowerCase().includes('bowl'));
        break;
      case 'allrounders':
        filtered = allPlayers.filter(p => p.playing_style?.toLowerCase().includes('all'));
        break;
      case 'base_price_desc':
        filtered = [...allPlayers].sort((a, b) => b.base_price - a.base_price);
        break;
      default:
        filtered = [...allPlayers];
    }

    if (filtered.length === 0) {
      customAlert("No Players Found", `No players found for "${type}" filter. Resetting to All Players.`, "info");
      setFilterType('serial');
      setPlayers([...allPlayers]);
      setCurrentPlayerIndex(0);
    } else {
      setFilterType(type);
      setPlayers(filtered);
      setCurrentPlayerIndex(0);
    }
  };

  const handleNextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
    } else {
      customAlert('End of List', 'You have reached the end of the list.', 'info');
    }
  };

  const handlePreviousPlayer = () => {
    if (currentPlayerIndex > 0) {
      setCurrentPlayerIndex(prev => prev - 1);
    }
  };

  if (!auctionDetails || players.length === 0) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading Live Auction...</p>
      </div>
    );
  }

  const player = players[currentPlayerIndex];

  return (
    <div className="auction-preview-container">
      <div className="auction-preview-header">
        <button className="AuctionFixture-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="auction-preview-auction">
        <h5>Auction Code : {auctionDetails.auction_code}</h5>
        <h3>{auctionDetails.auction_name} ➣ Season - {auctionDetails.auction_season}</h3>
        <h5>Date : {auctionDetails.auction_date}</h5>
      </div>

      <div className="auction-preview-card" style={{
        backgroundImage: `url(${backgrounds[backgroundKey]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="auction-preview-serial">{currentPlayerIndex + 1}</div>

        <div className="auction-preview-image-wrapper">
          <img
            src={`http://localhost:8000/storage/${player.image}`}
            alt={player.name}
            className="auction-preview-image"
          />
          {/* Filter Dropdown */}
          <select
            className="auction-preview-filter"
            value={filterType}
            onChange={(e) => applyFilter(e.target.value)}
          >
            <option value="serial">All Players</option>
            <option value="sold">Sold</option>
            <option value="unsold">Unsold</option>
            <option value="batters">Batters</option>
            <option value="bowlers">Bowlers</option>
            <option value="allrounders">All-rounders</option>
            <option value="base_price_desc">Base Price(High to Low)</option>
          </select>
        </div>

        <div className="auction-preview-info">
          <div className="auction-preview-name" style={{ color: textColors.playerName }}>{player.name}</div>
          <div className="auction-preview-role" style={{ color: textColors.playerRole }}>{player.playing_style}</div>
          <h2 style={{ color: textColors.playerInfo }}>Base Price: ₹{parseInt(player.base_price).toLocaleString('en-IN')}</h2>
          <h2 style={{ color: textColors.playerInfo }} className={player.sold_status === 'sold' ? 'sold-status' : 'unsold-status'}>
            Status: {player.sold_status ? player.sold_status.toUpperCase() : 'Not Yet Sold'}
          </h2>

          {player.sold_status === 'sold' && <img src="/sold1.png" alt="Sold" className="status-pre-stamp1" />}
          {player.sold_status === 'unsold' && <img src="/unsold1.png" alt="Unsold" className="status-pre-stamp2" />}

          {player.sold_status === 'sold' ? (
            <h2 style={{ color: textColors.playerInfo }}>
              Sold to: {teams.find(t => t.id === player.sold_team_id)?.team_short_name || 'N/A'} for ₹{player.sold_price.toLocaleString('en-IN')}
            </h2>
          ) : (
            <h2>&nbsp;</h2>
          )}

          <div className="auction-preview-buttons">
            <button onClick={handlePreviousPlayer} disabled={currentPlayerIndex === 0}>Prev</button>
            <button onClick={handleNextPlayer} disabled={currentPlayerIndex === players.length - 1}>Next</button>
          </div>
          <div className="auction-preview-counts">
            <h4 style={{ color: textColors.playerName }}>➤ Total Players : {totalPlayers}</h4>
            <h4 style={{ color: textColors.playerName }}>➤ Sold Players : {soldPlayers}</h4>
            <h4 style={{ color: textColors.playerName }}>➤ Unsold Players : {unsoldPlayers}</h4>
          </div>
        </div>
      </div>

      <div className="auction-preview-nav-buttons">
        <button onClick={() => navigate('/auction/teampoints-preview', { state: { auction_id } })}>Team Points</button>
        <button onClick={() => navigate('/auction/players-preview', { state: { auction_id } })}>Players List</button>
        <button onClick={() => navigate('/auction/teams-preview', { state: { auction_id } })}>Teams List</button>
        <button onClick={() => navigate('/auction/info-preview', { state: { auction_id } })}>Auction Info</button>
      </div>
    </div>
  );
};

export default AuctionPreview;
