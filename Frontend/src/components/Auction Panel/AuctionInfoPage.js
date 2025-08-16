import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { customAlert } from "../SweetAlertCommon/Custom";
import { baseURL } from "../../http";
import './AuctionInfoPage.css';
import axios from 'axios';

const AuctionInfoPage = () => {
  const navigate = useNavigate();
  const [auctionDetails, setAuctionDetails] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const auction_id = location.state?.auction_id;
  
  useEffect(() => {
  if (!auction_id) {
    customAlert('Missing Auction', 'No auction ID provided.', 'error');
    navigate('/auction-panel');
    return;
  }
}, [auction_id]);

  useEffect(() => {
    const fetchAuctionInfo = async () => {

      try {
        const [auctionRes, playersRes] = await Promise.all([
          axios.get(`${baseURL}/auction/${auction_id}`),
          axios.get(`${baseURL}/players/${auction_id}`)
        ]);

        setAuctionDetails(auctionRes.data.auction);
        setPlayers(playersRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch auction info:", error);
        setLoading(false);
      }
    };

    fetchAuctionInfo();
  }, [auction_id]);

  if (loading) {
  return (
    <div className="spinner-container"> 
      <div className="spinner"></div> 
        <p>Loading Auction Info...</p>
    </div>
  );
}

  const totalPlayers = players.length;
  const soldPlayers = players.filter(p => p.sold_status === 'sold').length;
  const unsoldPlayers = players.filter(p => p.sold_status === 'unsold').length;
  
  return (
    <div className="auction-info-container">
      <div className="auction-info-header">
        <button className="auction-info-back-button" onClick={() => navigate('/auction/live', { state: { auction_id } })}>
          ◄ Live Auction Page
        </button>
        <h2 className="auction-info-title">► Auction Information ◄</h2>
      </div>

      <div className="auction-info-layout-wrapper">
        <div className="auction-info-layout">
          <div className="auction-info-box">
            <h2 className="auction-info-box-header">➤ Auction Details</h2>
            <p><strong>• Auction Name:</strong> {auctionDetails?.auction_name}</p>
            <p><strong>• Auction Points per team:</strong> ₹{auctionDetails?.points_per_team.toLocaleString('en-IN')}</p>
            <p><strong>• Maximum Players Per Team:</strong> {auctionDetails?.max_players_per_team}</p>
            <p><strong>• Minimum Players Per Team:</strong> {auctionDetails?.min_players_per_team}</p>
            <p><strong>• Base Bid:</strong> ₹{auctionDetails?.base_bid?.toLocaleString('en-IN')}</p>
            <p><strong>• Bid Increment:</strong> ₹{auctionDetails?.bid_increase_by?.toLocaleString('en-IN')}</p>
            <p><strong>• Total Players Registered:</strong> {totalPlayers}</p>
            <p><strong>• Sold Players:</strong> {soldPlayers}</p>
            <p><strong>• Unsold Players:</strong> {unsoldPlayers}</p>
            <p><strong>• Players Left for Bid:</strong> {totalPlayers-soldPlayers-unsoldPlayers}</p>
          </div>

          <div className="auction-info-box">
           <h2 className="auction-info-box-header">➤ Auction Rules</h2>
           <p><strong>•</strong> Each team starts with the <strong>assigned auction points</strong>.</p>
           <p><strong>•</strong> Teams must buy the <strong>minimum required players</strong>.</p>
           <p><strong>•</strong> Bidding starts at the <strong>assigned base price</strong>.</p>
           <p><strong>•</strong> Teams <strong>cannot bid</strong> if they lack funds to meet the <strong>minimum player </strong>requirement.</p>
           <p><strong>•</strong> Filter players by <strong>Sold, Unsold, Role, Base Price, or Random</strong>.</p>
           <p><strong>•</strong> Unsold players can be <strong>re-auctioned</strong> later.</p>
           <p><strong>•</strong> Clicking <strong>"End Auction"</strong> will <strong>permanently close</strong> the auction for all teams. <strong>This action cannot be undone</strong>.</p>
         </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionInfoPage;
