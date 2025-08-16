import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { baseURL } from "../../http";
import './Join Auction.css';

const JoinAuction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchCode, setSearchCode] = useState('');
  const [searchedAuction, setSearchedAuction] = useState(null);
  const [error, setError] = useState('');
  const [auctionStatus, setAuctionStatus] = useState('');
  const [playerStats, setPlayerStats] = useState({ total: 0, sold: 0, unsold: 0 });
  const [auctionEndTime, setAuctionEndTime] = useState('');
  const [loading, setLoading] = useState(false);  // <-- Loading state added

  useEffect(() => {
    if (location.state?.auctionCode) {
      setSearchCode(location.state.auctionCode);
      setTimeout(() => {
        handleSearch(location.state.auctionCode);
      }, 100);
    }
  }, [location.state]);

  const handleSearch = async (codeParam) => {
    const codeToSearch = codeParam || searchCode;
    if (!codeToSearch.trim()) return;

    setLoading(true);  // <-- Start loading
    try {
      const response = await axios.get(`${baseURL}/auction/code/${codeToSearch}`);
      const auction = response.data.auction;
      setSearchedAuction(auction);
      setError('');

      const playersRes = await axios.get(`${baseURL}/players/${auction.id}`);
      const players = playersRes.data;
      const total = players.length;
      const sold = players.filter(p => p.sold_status === 'sold').length;
      const unsold = players.filter(p => p.sold_status === 'unsold').length;
      setPlayerStats({ total, sold, unsold });

      const hasActivity = sold > 0 || unsold > 0;
      const auctionEnded = localStorage.getItem(`auction_${auction.id}_ended`) === 'true';
      const endTimeStr = localStorage.getItem(`auction_${auction.id}_end_time`);
      setAuctionEndTime(endTimeStr || '');

      const now = new Date();
      const scheduledStart = combineDateTime(auction.auction_date, auction.auction_time);

      if (auctionEnded) {
        setAuctionStatus('ended');
      } else if (hasActivity) {
        setAuctionStatus('live');
      } else if (now > scheduledStart) {
        setAuctionStatus('delayed');
      } else {
        setAuctionStatus('not_started');
      }

    } catch (err) {
      setSearchedAuction(null);
      setError('No auction found with that code.');
    } finally {
      setLoading(false);  // <-- Stop loading
    }
  };

  const combineDateTime = (dateStr, timeStr) => new Date(`${dateStr}T${timeStr}`);

  const formatDateTime = (datetimeStr) => {
    const options = {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    };
    return new Date(datetimeStr).toLocaleString(undefined, options).replace(/am|pm/i, m => m.toUpperCase());
  };

  const renderPlayerStats = () => (
    <div style={{ marginTop: '10px', color: '#333' }}>
      <p><strong>Total Registered Players :</strong> {playerStats.total}</p>
      <p><strong>Sold Players :</strong> {playerStats.sold}</p>
      <p><strong>Unsold Players :</strong> {playerStats.unsold}</p>
    </div>
  );

  return (
    <div className="JoinAuctionPreview-container">
      <div className="JoinAuctionPreview-header">
        <button className="JoinAuctionPreview-back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="JoinAuctionPreview-title">Join Auction</h2>
      </div>

      <div className="JoinAuctionPreview-search-bar">
        <label htmlFor="auction-code">Enter Code to Join Auction</label>
        <input
          id="auction-code"
          type="text"
          placeholder="Enter Auction Code"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
        />
        <button className="JoinAuctionPreview-enter-bar" onClick={() => handleSearch()}>Search</button>
      </div>

      {loading && <div className="spinner-container">
      <div className="spinner"></div>
      <p>Loading Auction details...</p>
    </div>}

      {error && <p className="JoinAuctionPreview-error">{error}</p>}

      {!loading && searchedAuction && (
        <div className="JoinAuctionPreview-auction-card">
          <img
            src={searchedAuction.auction_logo || '/default-logo.png'}
            className="JoinAuctionPreview-logo"
            alt="Auction Logo"
          />
          <h3>{searchedAuction.auction_name} ➣ Season - {searchedAuction.auction_season}</h3>

          {auctionStatus === 'not_started' && (
            <p style={{ color: '#007BFF', fontWeight: 'bold' }}>
              Auction has not started yet.<br />
              Starts on : {formatDateTime(combineDateTime(searchedAuction.auction_date, searchedAuction.auction_time))}
            </p>
          )}

          {auctionStatus === 'live' && (
            <>
              <p style={{ color: 'green', fontWeight: 'bold' }}>Auction is live now!</p>
              {renderPlayerStats()}
              <button onClick={() => navigate('/auction/preview', { state: { auction_id: searchedAuction.id } })}>
                Join Live Auction
              </button>
            </>
          )}

          {auctionStatus === 'ended' && (
            <>
              <p style={{ color: 'red', fontWeight: 'bold' }}>
                Auction has ended{auctionEndTime ? ` on ${formatDateTime(auctionEndTime)}` : '.'}
              </p>
              {renderPlayerStats()}
              <button style={{ background: 'red' }} onClick={() => navigate('/auction/preview', { state: { auction_id: searchedAuction.id } })}>
                View Auction
              </button>
            </>
          )}

          {auctionStatus === 'delayed' && (
            <p style={{ color: '#ff6600', fontWeight: 'bold' }}>
              The auction was supposed to start on {formatDateTime(combineDateTime(searchedAuction.auction_date, searchedAuction.auction_time))}.<br />
              but is currently delayed. We're working to begin as soon as possible.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default JoinAuction;
