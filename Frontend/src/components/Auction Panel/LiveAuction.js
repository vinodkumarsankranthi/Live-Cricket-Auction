import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { customAlert } from "../SweetAlertCommon/Custom";
import Swal from 'sweetalert2';
import axios from 'axios';
import { baseURL } from "../../http";
import './LiveAuction.css';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const LiveAuction = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const auction_id = location.state?.auction_id;

  const [seenPlayerIds, setSeenPlayerIds] = useState(new Set());
  const [seenRandomCleanIds, setSeenRandomCleanIds] = useState(new Set());
  const [manualInputValue, setManualInputValue] = useState('');
  const [auctionDetails, setAuctionDetails] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [soldStatus, setSoldStatus] = useState(null);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [currentBid, setCurrentBid] = useState(0);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [soldTeamId, setSoldTeamId] = useState(null);
  const [filterType, setFilterType] = useState('serial');
  const [lastBiddingTeamId, setLastBiddingTeamId] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    playerName: '#ffffff', //white 
    playerRole: '#ffffff', //white 
    playerInfo: '#16213e', //navy blue  
  },
  theme2: {
    playerName: '#16213e', //navy blue  
    playerRole: '#16213e', //navy blue
    playerInfo: '#ffffff', //white     
  },
  theme3: {
    playerName: '#ffa500', //orange
    playerRole: '#ffa500', //orange
    playerInfo: '#ffffff', //white
  },
  theme4: {
    playerName: '#16213e', //navy blue  
    playerRole: '#16213e', //navy blue  
    playerInfo: '#ffffff', //white    
  },
  theme5: {
    playerName: '#ffa500', //orange    
    playerRole: '#ffa500', //orange 
    playerInfo: '#ffffff', //white     
  },
  theme6: {
    playerName: '#ffa500', //orange     
    playerRole: '#ffa500', //orange   
    playerInfo: '#16213e', //navy blue   
  },
  theme7: {
    playerName: '#ffa500', //orange   
    playerRole: '#ffa500', //orange
    playerInfo: '#16213e', //navy blue    
  },
  theme8: {
    playerName: '#ffffff', //white     
    playerRole: '#ffffff', //white  
    playerInfo: '#ffffff', //white        
  },
  theme9: {
    playerName: '#ffa500', //orange    
    playerRole: '#ffa500', //orange  
    playerInfo: '#ffffff', //white        
  },
  theme10: {
    playerName: '#ffa500', //orange 
    playerRole: '#ffa500', //orange  
    playerInfo: '#ffffff', //white      
  },
   theme11: {
    playerName: '#ffa500', //orange    
    playerRole: '#ffa500', //orange 
    playerInfo: '#ffffff', //white 
  },
   theme12: {
    playerName: '#ffa500', //orange    
    playerRole: '#ffa500', //orange 
    playerInfo: '#ffffff', //white     
  },
};


  const initialBackground = localStorage.getItem(`selectedBackground_${auction_id}`) || 'auctionbg1';
  const initialTheme = backgroundThemeMap[initialBackground];

  const [selectedBackground, setSelectedBackground] = useState(initialBackground);
  const [textColors, setTextColors] = useState(backgroundTextColors[initialTheme]);
  const [tempBackground, setTempBackground] = useState(initialBackground);

  const planLimitMap = {
  bronze:1,
  silver: 5,
  gold: 8,
  platinum: 12,
  premium: 15,
  premium_Plus:Infinity,
};

const limit = planLimitMap[user?.plan] || 0;

  useEffect(() => {
    if (isSettingsOpen) {
      setTempBackground(selectedBackground);
    }
  }, [isSettingsOpen]);

  const applyBackground = () => {
    setSelectedBackground(tempBackground);
    const selectedTheme = backgroundThemeMap[tempBackground];
    setTextColors(backgroundTextColors[selectedTheme]);
    localStorage.setItem(`selectedBackground_${auction_id}`, tempBackground);
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    localStorage.setItem(`selectedBackground_${auction_id}`, selectedBackground);
  }, [selectedBackground, auction_id]);

  useEffect(() => {
    const ended = localStorage.getItem(`auction_${auction_id}_ended`);
    if (ended === 'true') {
      setAuctionEnded(true);
      localStorage.removeItem(`auction_${auction_id}_current_bid`);
      localStorage.removeItem(`auction_${auction_id}_selected_team_id`);
      localStorage.removeItem(`auction_${auction_id}_last_bid_team_id`);
      localStorage.removeItem(`auction_${auction_id}_players`);
      localStorage.removeItem(`auction_${auction_id}_teams`);
    }
  }, [auction_id]);

  useEffect(() => {
    if (!auction_id) {
      customAlert('Missing Auction', 'No auction ID provided.', 'error');
      navigate('/auction-panel');
    }
  }, [auction_id]);

  const shuffleArray = (array) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auctionRes, playersRes, teamsRes] = await Promise.all([
          axios.get(`${baseURL}/auction/${auction_id}`),
          axios.get(`${baseURL}/players/${auction_id}`),
          axios.get(`${baseURL}/auction/${auction_id}/teams`)
        ]);

        const allPlayers = playersRes.data;
        const lastId = localStorage.getItem(`auction_${auction_id}_last_player_id`);
        const index = allPlayers.findIndex(p => p.id === parseInt(lastId));
        const validIndex = index !== -1 ? index : 0;

        setAuctionDetails(auctionRes.data.auction);
        setAllPlayers(allPlayers);
        setPlayers(allPlayers);
        setTeams(teamsRes.data.teams);
        setCurrentPlayerIndex(validIndex);
        setIsDataReady(true);
      } catch (error) {
        customAlert('Error', 'Failed to load auction data. Please try again.', 'error');
      }
        const savedBid = localStorage.getItem(`auction_${auction_id}_current_bid`);
        const savedSelectedTeamId = localStorage.getItem(`auction_${auction_id}_selected_team_id`);
        const savedLastBiddingTeamId = localStorage.getItem(`auction_${auction_id}_last_bid_team_id`);
        const savedPlayers = localStorage.getItem(`auction_${auction_id}_players`);
        const savedTeams = localStorage.getItem(`auction_${auction_id}_teams`);
        const saved = localStorage.getItem(`selectedBackground_${auction_id}`);

        if (savedBid) setCurrentBid(parseInt(savedBid));
        if (savedSelectedTeamId) setSelectedTeamId(parseInt(savedSelectedTeamId));
        if (savedLastBiddingTeamId) setLastBiddingTeamId(parseInt(savedLastBiddingTeamId));
        if (savedPlayers) setAllPlayers(JSON.parse(savedPlayers));
        if (savedTeams) setTeams(JSON.parse(savedTeams));
    };
    fetchData();
  }, [auction_id]);

  useEffect(() => {
    const player = players[currentPlayerIndex];
    if (player?.sold_status === 'sold') {
      setSelectedTeamId(player.sold_team_id);
      setSoldTeamId(player.sold_team_id);
    } else {
      setSelectedTeamId(null);
      setSoldTeamId(null);
    }
  }, [currentPlayerIndex, players]);

  useEffect(() => {
    const player = players[currentPlayerIndex];
    if (player) {
      localStorage.setItem(`auction_${auction_id}_last_player_id`, player.id);
    }
  }, [currentPlayerIndex]);

  const resetPlayerState = () => {
    setSoldStatus(null);
    setButtonsDisabled(false);
    setCurrentBid(0);
    setSelectedTeamId(null);
    setSoldTeamId(null);
    setLastBiddingTeamId(null);
  };

  const applyFilter = (type) => {
    let filtered = [];
    switch (type) {
      case 'serial':
        filtered = [...allPlayers];
        break;
      case 'random': {
        const unseenPlayers = allPlayers.filter(p => !seenPlayerIds.has(p.id));
        if (unseenPlayers.length === 0) {
          setSeenPlayerIds(new Set());
          filtered = shuffleArray(allPlayers);
        } else {
          filtered = shuffleArray(unseenPlayers);
          const updatedSeen = new Set(seenPlayerIds);
          filtered.forEach(p => updatedSeen.add(p.id));
          setSeenPlayerIds(updatedSeen);
        }
        break;
      }
      case 'random_no_sold_unsold': {
        const cleanPlayers = allPlayers.filter(p => !p.sold_status && !seenRandomCleanIds.has(p.id));
        if (cleanPlayers.length === 0) {
          setSeenRandomCleanIds(new Set());
          filtered = shuffleArray(allPlayers.filter(p => !p.sold_status));
        } else {
          filtered = shuffleArray(cleanPlayers);
          const updatedSeen = new Set(seenRandomCleanIds);
          filtered.forEach(p => updatedSeen.add(p.id));
          setSeenRandomCleanIds(updatedSeen);
        }
        break;
      }
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
      customAlert("No Players Found", `No players found for "${type}" filter. Resetting to Serial.`, "info");
      setFilterType('serial');
      setPlayers([...allPlayers]);
      setCurrentPlayerIndex(0);
    } else {
      setPlayers(filtered);
      setCurrentPlayerIndex(0);
    }

    resetPlayerState();
  };
  
 

  useEffect(() => {
  if (currentPlayerIndex >= players.length - 1) {
    setIsNextDisabled(true);
  } else {
    setIsNextDisabled(false);
  }
}, [currentPlayerIndex, players.length]);

const handleNextPlayer = () => {
  if (currentPlayerIndex < players.length - 1) {
    setCurrentPlayerIndex(i => i + 1);
    setIsNextDisabled(false);
    resetPlayerState();
  }
};

const handlePreviousPlayer = () => {
  if (currentPlayerIndex > 0) {
    setCurrentPlayerIndex(i => i - 1);
    setIsNextDisabled(false); 
    resetPlayerState();
  }
};

const handleSold = async () => {
  const player = players[currentPlayerIndex];
  if (!selectedTeamId) {
    customAlert('warning', 'Please select a team before marking as sold.', 'warning');
    return;
  }

  try {
    await axios.post(`${baseURL}/players/${player.id}/sold`, {
      team_id: selectedTeamId,
      sold_price: currentBid,
    });

    setSoldStatus('sold');
    setButtonsDisabled(true);
    setSoldTeamId(selectedTeamId);
    if (!localStorage.getItem(`auction_${auction_id}_first_activity_time`)) {
      localStorage.setItem(`auction_${auction_id}_first_activity_time`, Date.now().toString());
    }

    const updatedPlayers = [...players];
    const updatedAllPlayers = [...allPlayers];
    const updatedPlayer = {
      ...player,
      sold_status: 'sold',
      sold_team_id: selectedTeamId,
      sold_price: currentBid,
    };
    updatedPlayers[currentPlayerIndex] = updatedPlayer;
    const indexInAll = allPlayers.findIndex(p => p.id === player.id);
    if (indexInAll !== -1) {
      updatedAllPlayers[indexInAll] = updatedPlayer;
    }
    setPlayers(updatedPlayers);
    setAllPlayers(updatedAllPlayers);

    const updatedTeams = teams.map(team => {
      if (team.id === selectedTeamId) {
        const pointsUsed = parseInt(team.points_used, 10) || 0;
        const playersBought = parseInt(team.players_bought, 10) || 0;
        const baseBid = parseInt(auctionDetails.base_bid, 10) || 0;
        const minPlayersPerTeam = parseInt(auctionDetails.min_players_per_team, 10) || 0;
        const newPointsUsed = pointsUsed + currentBid;  
        const newPlayersBought = playersBought + 1;
        const reservePlayersNeeded = Math.max((minPlayersPerTeam - 1) - playersBought, 0); 
        const reservePoints = baseBid * reservePlayersNeeded;
        const amountAvailable = parseInt(team.amount_available, 10) || 0;
        const availableAfterReserve = amountAvailable - newPointsUsed - reservePoints;
        return {
          ...team,
          points_used: newPointsUsed,
          players_bought: newPlayersBought,
          reserve_points: reservePoints,
          available_after_reserve: availableAfterReserve,
        };
      }
      return team;
    });

    setTeams(updatedTeams);
      localStorage.setItem(`auction_${auction_id}_players`, JSON.stringify(updatedAllPlayers));
      localStorage.setItem(`auction_${auction_id}_teams`, JSON.stringify(updatedTeams));
      } catch (error) {
    customAlert('Error', 'Failed to mark player as sold.', 'error');
  }
};


  const handleUnsold = async () => {
    const player = players[currentPlayerIndex];
    try {
      await axios.post(`${baseURL}/players/${player.id}/unsold`);
      setSoldStatus('unsold');
      const updatedPlayers = [...players];
      const updatedAllPlayers = [...allPlayers];
      const updatedPlayer = {
      ...player,
      sold_status: 'unsold',
      sold_team_id: null,
      sold_price: null
   };

updatedPlayers[currentPlayerIndex] = updatedPlayer;
const indexInAll = allPlayers.findIndex(p => p.id === player.id);
if (indexInAll !== -1) {
  updatedAllPlayers[indexInAll] = updatedPlayer;
}

setPlayers(updatedPlayers);
setAllPlayers(updatedAllPlayers);
    if (!localStorage.getItem(`auction_${auction_id}_first_activity_time`)) {
      localStorage.setItem(`auction_${auction_id}_first_activity_time`, Date.now().toString());
    }
    } catch (error) {
      customAlert('Error', 'Failed to mark player as unsold.', 'error');
    }
  };
  useEffect(() => {
  if (!players.length) return;
  const player = players[currentPlayerIndex];
  if (!player) return;
  teams.forEach(team => {
    const teamAmountAvailable = parseInt(team.amount_available, 10) || 0;
    const teamPointsUsed = parseInt(team.points_used, 10) || 0;
    const baseBid = parseInt(auctionDetails.base_bid, 10) || 0;
    const minPlayersPerTeam = parseInt(auctionDetails.min_players_per_team, 10) || 0;
    const playersBought = parseInt(team.players_bought, 10) || 0;
    const reservePlayersNeeded = Math.max((minPlayersPerTeam - 1) - playersBought, 0);
    const reservePoints = baseBid * reservePlayersNeeded;
    const availableAfterReserve = teamAmountAvailable - teamPointsUsed - reservePoints;
    console.log(`Team ${team.team_short_name} available points:`, availableAfterReserve);
  });
}, [currentPlayerIndex, teams, auctionDetails, players]);

const handleTeamBid = (teamId) => {
  const increment = parseInt(auctionDetails.bid_increase_by, 10) || 0;
  const base = parseInt(players[currentPlayerIndex].base_price, 10) || 0;
  const team = teams.find(t => t.id === teamId);
  if (!team) {
    console.log("Team not found. Showing error alert.");
    customAlert("Error", "Selected team not found.", "error");
    return;
  }
  const teamAmountAvailable = parseInt(team.amount_available, 10) || 0;
  const teamPointsUsed = parseInt(team.points_used, 10) || 0;
  const baseBid = parseInt(auctionDetails.base_bid, 10) || 0;
  const minPlayersPerTeam = parseInt(auctionDetails.min_players_per_team, 10) || 0;
  const playersBought = parseInt(team.players_bought, 10) || 0;
  const reservePlayersNeeded = Math.max((minPlayersPerTeam - 1) - playersBought, 0);
  const reservePoints = baseBid * reservePlayersNeeded;
  const availableAfterReserve = teamAmountAvailable - teamPointsUsed - reservePoints;
  const nextBid = currentBid === 0 ? base : currentBid + increment;
 
  if (nextBid > availableAfterReserve) {
    customAlert("Insufficient Points", `${team.team_short_name} cannot bid more because it has only ${availableAfterReserve} points available.`, "warning");
    return;
  }
  
  if (team.players_bought >= auctionDetails.max_players_per_team) {
    customAlert("Team Limit Reached", `${team.team_short_name} has already bought the maximum allowed players(${auctionDetails.max_players_per_team}).`, "warning");
    return;
  }

  if (teamId === lastBiddingTeamId) {
    customAlert("Invalid Bid", "You can't bid consecutively with the same team.", "info");
    return;
  }

  setCurrentBid(nextBid);
  setSelectedTeamId(teamId);
  setLastBiddingTeamId(teamId);
    localStorage.setItem(`auction_${auction_id}_current_bid`, nextBid);
    localStorage.setItem(`auction_${auction_id}_selected_team_id`, teamId);
    localStorage.setItem(`auction_${auction_id}_last_bid_team_id`, teamId);
  };

  if (!isDataReady) {
    return (
    <div className="spinner-container"> 
      <div className="spinner"></div> 
        <p>Loading Live Auction...</p>
    </div>
  );
  }
  const player = players[currentPlayerIndex];

  const handleEndAuction = () => {
  const minPlayers = parseInt(auctionDetails.min_players_per_team, 10) || 0;
  const teamsNotMeetingMin = teams.filter(team => {
    const bought = parseInt(team.players_bought, 10) || 0;
    return bought < minPlayers;
  });

  if (teamsNotMeetingMin.length > 0) {
    const teamNames = teamsNotMeetingMin.map(t => t.team_short_name).join(' , ');
    customAlert("Cannot End Auction",`The following teams have not bought the minimum (${minPlayers}) required players ➤ ${teamNames}` , "warning");
    return;
  }
  Swal.fire({
    icon: 'question',
    title: 'Are you sure?',
    text: 'Ending the auction will finalize all current bids and prevent further changes.',
    showCancelButton: true,
    confirmButtonText: 'Yes, end it!',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#ff0000',
    background: '#f3f3f3',
    customClass: {
      container: 'my-custom-container-class',
      title: 'my-custom-title-class',
      content: 'my-custom-content-class',
      confirmButton: 'my-custom-button-class'
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        setAuctionEnded(true);
        setButtonsDisabled(true);
        localStorage.setItem(`auction_${auction_id}_ended`, 'true');
        localStorage.setItem(`auction_${auction_id}_end_time`, new Date().toISOString());
        customAlert("Auction Ended", "The auction has been ended successfully.", "success");
        navigate('/auction-panel');
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to end the auction. Please try again.',
        });
      }
    }
  });
};

const handleReAuction = async () => {
  const player = players[currentPlayerIndex];
  const previousTeamId = player.sold_team_id;
  const soldPrice = player.sold_price;

  if (player.sold_status === 'sold' || player.sold_status === 'unsold') {
    try {
      const response = await fetch(`${baseURL}/players/${player.id}/player-reauction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Re-auction failed on server.');
      }
      const updatedTeams = teams.map(team => {
        if (player.sold_status === 'sold' && team.id === previousTeamId) {
          const pointsUsed = parseInt(team.points_used, 10) || 0;
          const playersBought = parseInt(team.players_bought, 10) || 0;
          const baseBid = parseInt(auctionDetails.base_bid, 10) || 0;
          const minPlayersPerTeam = parseInt(auctionDetails.min_players_per_team, 10) || 0;
          const newPointsUsed = pointsUsed - soldPrice;
          const newPlayersBought = playersBought - 1;
          const reservePlayersNeeded = Math.max((minPlayersPerTeam - 1) - newPlayersBought, 0);
          const reservePoints = baseBid * reservePlayersNeeded;
          const amountAvailable = parseInt(team.amount_available, 10) || 0;
          const availableAfterReserve = amountAvailable - newPointsUsed - reservePoints;
          return {
            ...team,
            points_used: newPointsUsed,
            players_bought: newPlayersBought,
            reserve_points: reservePoints,
            available_after_reserve: availableAfterReserve,
          };
        }
        return team;
      });

      const updatedPlayers = [...players];
      const updatedAllPlayers = [...allPlayers];
      const updatedPlayer = {
        ...player,
        sold_status: null,
        sold_team_id: null,
        sold_price: null,
      };
      updatedPlayers[currentPlayerIndex] = updatedPlayer;
      const indexInAll = allPlayers.findIndex(p => p.id === player.id);
      if (indexInAll !== -1) {
        updatedAllPlayers[indexInAll] = updatedPlayer;
      }
      setTeams(updatedTeams);
      setPlayers(updatedPlayers);
      setAllPlayers(updatedAllPlayers);
      setSoldStatus(null);
      setSoldTeamId(null);
      setSelectedTeamId(null);
      setCurrentBid(0);
      setLastBiddingTeamId(null);

      localStorage.setItem(`auction_${auction_id}_players`, JSON.stringify(updatedAllPlayers));
      localStorage.setItem(`auction_${auction_id}_teams`, JSON.stringify(updatedTeams));

      customAlert("Re-auction Started", "Player is back in auction pool and previous team’s resources are reverted.", "info");
    } catch (error) {
      customAlert("Re-auction Error", error.message, "error");
    }
  } else {
    customAlert("Re-auction", "This player was not sold or unsold before.", "info");
  }
};

return (
    <div className="live-auction-container">
      <div className="live-auction-header-container">
        <button className="all-back-button" onClick={() => navigate('/auction-panel')}>
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="live-auction-body-container">
        <div className="auction-live-auction"><h5>Auction Code : {auctionDetails.auction_code}</h5> <h3>{auctionDetails.auction_name} ➣ Season - {auctionDetails.auction_season}</h3> <h5>Date : {auctionDetails.auction_date}</h5></div>
        <div className="top-row10" >          
          <div className="live-auction-player-card-container" style={{
            backgroundImage: `url(${backgrounds[selectedBackground]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            }}>
            <div className="serial-no-badge10">{currentPlayerIndex + 1}</div>
            <div className="player-image-wrapper10">
              <img src={`http://localhost:8000/storage/${player.image}`} alt={player.name} className="player-image10" />
              <div className="live-auction-filter-bar" >
              <input type="text" className="live-auction-search-bar"placeholder="Search"value={filterType === 'serial' ? manualInputValue : `${currentPlayerIndex + 1}`}onChange={(e) => {
               if (filterType === 'serial') {
                setManualInputValue(e.target.value);
               }
              }}
             onKeyDown={(e) => {
          if (filterType === 'serial' && e.key === 'Enter') {
           const index = parseInt(manualInputValue) - 1;
          if (!isNaN(index) && index >= 0 && index < players.length) {
        setCurrentPlayerIndex(index);
        resetPlayerState();
      } else {
        setTimeout(() => {
          customAlert('Invalid Number', `Please enter a valid serial number within 1 to ${players.length}.`, 'info');
        }, 100);
        }
       }
          }}
           style={{
           pointerEvents: filterType === 'serial' ? 'auto' : 'none',
           backgroundColor: filterType === 'serial' ? 'white' : '#f0f0f0',
           userSelect: 'none',
           caretColor: 'transparent'}}/>
            <select
                className='live-auction-select-bar'
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    applyFilter(e.target.value);
                  }}
                >
                  <option value="serial">Serial No / Manual</option>
                  <option value="random">All Random</option>
                  <option value="sold">Sold Players</option>
                  <option value="unsold">Unsold Players</option>
                  <option value="random_no_sold_unsold">Random (No Sold/Unsold)</option>
                  <option value="batters">Batters</option>
                  <option value="bowlers">Bowlers</option>
                  <option value="allrounders">All Rounders</option>
                  <option value="base_price_desc">Base Price (High to Low)</option>
                </select>
              </div>
            </div>

            {player.sold_status === 'sold' && <img src="/sold1.png" alt="Sold" className="status-stamp1" />}
            {player.sold_status === 'unsold' && <img src="/unsold1.png" alt="Unsold" className="status-stamp2" />}

            <div className="player-info10">
              <div className="player-name-strip10" style={{ color: textColors.playerName }}>
                <span>{player.name}</span>
              </div>
              <div className="player-role-strip10" style={{ color: textColors.playerRole }}>
                <span>{player.playing_style}</span>
              </div>
              <div className="player-actions101">
                <h2 style={{ color: textColors.playerInfo }}>Base Price: ₹{Number(player.base_price || 0).toLocaleString('en-IN')}</h2>
                <div style={{ display: 'flex', gap: '100px', height: '50px', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, color: textColors.playerInfo }}>Bid Increase: ₹{Number(auctionDetails?.bid_increase_by || 0).toLocaleString('en-IN')}</h2>
                </div>
                <h1 style={{ color: textColors.playerInfo }}>
                  {player.sold_status === 'sold'
                    ? `Sold to ${teams.find(t => t.id === player.sold_team_id)?.team_short_name || 'Team'} for ₹${Number(player.sold_price || 0).toLocaleString('en-IN')}`
                    : `Current Bid: ₹${Number(currentBid || 0).toLocaleString('en-IN')}`}
                </h1>
              </div>
              <div className="sell-buttons10"> 
                <button className="previous-player"onClick={handlePreviousPlayer}disabled={currentPlayerIndex === 0}>Prev</button>
                {!auctionEnded && (<>
                {player.sold_status === null ? (<>
                <button className="sold" onClick={handleSold} disabled={buttonsDisabled}>Sold</button>
                <button className="unsold" onClick={handleUnsold} disabled={buttonsDisabled}>Unsold</button>
                 </>
                 ) : (
                <button className="sold" onClick={handleReAuction}>Player Re-Auction</button>
                 )}
                </>)}
                <button className="next-player"onClick={handleNextPlayer}disabled={isNextDisabled}>Next</button>
              </div>

             <div className="team-short-names1010">
               {(() => {
                 const planLimits = {
                   bronze:2,
                   silver: 4,
                   gold: 7,
                   platinum: 12,
                   premium:18 ,
                   premium_plus:teams.length,
                 };

                 const userPlan = user?.plan || 'bronze';
                 const visibleTeamsCount = planLimits[userPlan.toLowerCase()] || 2;
                 const visibleTeams = teams.slice(0, visibleTeamsCount);
                 const showMore = teams.length > visibleTeamsCount;

                 return (
                   <>
                     {visibleTeams.map(team => (
                       <button
                         key={team.id}
                         className={`team-button1010 ${selectedTeamId === team.id ? 'selected' : ''}`}
                         onClick={() => {
                           console.log("Button clicked for team:", team.team_short_name);
                           handleTeamBid(team.id);
                         }}
                         disabled={buttonsDisabled || auctionEnded || player.sold_status === 'sold' || player.sold_status === 'unsold'}
                       >
                         {team.team_short_name}
                       </button>
                     ))}
                     {showMore && (
                       <button
                         className="team-button1010 more-teams"
                         onClick={() => {customAlert('Upgrade Needed', 'Upgrade your plan to access more teams.', 'info');navigate('/pricing');}}>+ more Teams?</button>
                       )}
                   </>
                 );
               })()}
             </div>
            </div>
          </div>
        </div>

     <div className="centered-buttons10">
       <button onClick={() => navigate('/auction/teampoints-preview', { state: { auction_id } })}>Team Points</button>
       <button onClick={() => navigate('/auction/players-preview', { state: { auction_id } })}>Players List</button>
       <button onClick={() => navigate('/auction/teams-preview', { state: { auction_id } })}>Teams List</button>
       <button onClick={() => navigate('/auction/info', { state: { auction_id } })}>Auction Info</button>
       <button onClick={() => setIsSettingsOpen(true)}>Themes</button>
       {!auctionEnded && (<button className="end-auction-button" onClick={handleEndAuction}>End Auction</button>)}
     </div>
    </div>
      {isSettingsOpen && (
      <div className="modal-overlay">
        <div className="settings-modal">
          <h3>Select Background Theme</h3>
          <div className="background-options" style={{ display: 'flex', gap: '10px' }}>
            {Object.entries(backgrounds).map(([key, url], index) => {
              const isLocked = index >= limit;
              return (
                <div
                  key={key}
                  className={`bg-thumbnail ${tempBackground === key ? 'selected' : ''}`}
                  onClick={() => {
                    if (isLocked) {
                      customAlert('Upgrade Required', 'Please upgrade your plan to apply this theme.', 'info');
                      navigate('/pricing');
                      return;
                    }
                    setTempBackground(key);
                  }}
                  style={{
                    position: 'relative',
                    border: tempBackground === key ? '3px solid #007BFF' : '3px solid #ffffff',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    width: '100px',
                    height: '60px',
                    opacity: isLocked ? 0.6 : 1,
                  }}
                  title={isLocked ? 'Upgrade your plan to unlock this theme' : 'Click to apply theme'}>
                  <img src={url} alt={key} style={{width: '100%',height: '100%',objectFit: 'cover',borderRadius: '8px',}}/>
                       {isLocked && (
                    <div className="theme-locked-overlay">
                      <span style={{ fontSize: '18px' }}>🚫</span>
                      <span>Upgrade Plan</span>
                      <span style={{ fontSize: '11px' }}>to unlock theme</span>
                    </div>
                  )}
                </div>
                );
              })}
          </div>
          <div className="modal-button-group">
           <button onClick={applyBackground}>Apply</button>
           <button onClick={() => setIsSettingsOpen(false)}>Cancel</button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};
export default LiveAuction;