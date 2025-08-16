import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { baseURL } from "../../http";
import './TeamPoints.css';
import { customAlert } from "../SweetAlertCommon/Custom";
import { formatIndianNumber } from '../numberFormatter';

const TeamPoints = () => {
  const location = useLocation();
  const auction_id = location.state?.auction_id;
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);

  const backgroundImageUrl = process.env.PUBLIC_URL + '/teambackground.png'; 
  
useEffect(() => {
  if (!auction_id) {
    customAlert("Missing Auction ID", "Auction ID was not provided. Redirecting back.", "error");
    navigate('/auction-panel');
  }
}, [auction_id]);


  useEffect(() => {
    fetchTeamsAndAuction();
  }, []);

  const fetchTeamsAndAuction = async () => {
    try {
      const [teamsResponse, auctionResponse] = await Promise.all([
        axios.get(`${baseURL}/auction/${auction_id}/teams`),
        axios.get(`${baseURL}/auction/${auction_id}`)
      ]);

      const teamsData = teamsResponse.data.teams;
      const teamsWithPlayers = await Promise.all(
        teamsData.map(async (team) => {
          const playersRes = await axios.get(`${baseURL}/auction/${auction_id}/team/${team.id}/players`);
          const players = playersRes.data.players || [];

          const pointsUsed = players.reduce((total, player) => {
            return total + (parseFloat(player.sold_price) || 0);
          }, 0);

          return {
            ...team,
            players_bought: players.length,
            points_used: pointsUsed,
          };
        })
      );

      setTeams(teamsWithPlayers);
      setAuction(auctionResponse.data.auction);
    } catch (error) {
      console.error('Error fetching data:', error);
      customAlert('Error', 'Failed to fetch teams or auction.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamClick = (teamId) => {
  navigate('/auction/team/players-preview', { state: { auction_id, teamId } });
  };

  if (loading) {
     return (
    <div className="spinner-container"> 
      <div className="spinner"></div> 
        <p>Loading Team Points...</p>
    </div>
  );
  }

  if (!auction) {
    return <div>Error: Auction data not found.</div>;
  }

  return (
    <div className="teampoints-container">
      <div className="teampoints-header-container">
        <button className="all-back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="all-auction-title">Team Points</h2>
        <p className="teampoints-info-text">[ Click on Teams to Know your Players ]</p>
      </div>

      <div className="teampoints-body-container">
        <div className="teampoints-teams-grid">
          {teams.map((team) => {
            const totalPoints = Number(team.amount_available);
            const reservePoints = auction.base_bid * Math.max((auction.min_players_per_team-1) - team.players_bought,0);
            const availableAfterReserve = (totalPoints - reservePoints) - team.points_used;

            return (
              <div
                key={team.id}
                className="teampoints-team-card"
                style={{
                  backgroundImage: `url(${backgroundImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundBlendMode: 'overlay',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                }}
                onClick={() => handleTeamClick(team.id)}
              >
                <h2 className="teampoints-team-name">{team.team_name}</h2>

                {/* Row 1: Total Points + Reserve Points */}
                <div className="teampoints-points-row-group">
                  <div className="teampoints-points-row">
                    <span>➤ Total Points : ₹ {formatIndianNumber(Math.round(totalPoints))|| 0}</span>
                  </div>
                  <div className="teampoints-points-row">
                    <span>➤ Reserve Points : ₹ {formatIndianNumber(Math.round(reservePoints)) || 0}</span>
                  </div>
                </div>

                {/* Row 2: Players Bought + Players Left (Min) + Max */}
                <div className="teampoints-points-row-group">
                  <div className="teampoints-points-row">
                    <span>➤ Players Bought : {team.players_bought || 0}</span>
                    <span>➤ Min players : {Math.max(auction.min_players_per_team - team.players_bought, 0) || 0}</span>
                    <span>➤ Max Players : {Math.max(auction.max_players_per_team - team.players_bought, 0) || 0}</span>
                  </div>
                </div>

                {/* Row 3: Points Used + Available After Reserve */}
                <div className="teampoints-points-row-group">
                  <div className="teampoints-points-row-bold">
                    <span>➤ Points Used : ₹ {formatIndianNumber(Math.round(team.points_used)) || 0}</span>
                  </div>
                  <div className="teampoints-points-row-bold">
                    <span>➤ Amount Left : ₹ {formatIndianNumber(Math.round(availableAfterReserve)) || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeamPoints;
