import React, { useEffect, useState } from "react";
import axios from "axios";
import './UpcominAuction.css';
import { baseURL } from "../../http";
import { FaCalendarAlt, FaClock, FaUsers } from "react-icons/fa";
import { formatIndianNumber } from "../numberFormatter";
import { useNavigate } from 'react-router-dom';

const UpcomingAuction = () => {
  const [auctions, setAuctions] = useState([]);
  const [playerStatsMap, setPlayerStatsMap] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("today");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setAuctions(prev => [...prev]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPlayerStats = async (auctionId) => {
    try {
      const playersRes = await axios.get(`${baseURL}/players/${auctionId}`);
      const players = playersRes.data;
      const sold = players.filter(p => p.sold_status === 'sold').length;
      const unsold = players.filter(p => p.sold_status === 'unsold').length;
      return { sold, unsold, total: players.length };
    } catch {
      return { sold: 0, unsold: 0, total: 0 };
    }
  };

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}/auctions/upcoming`);
      const auctions = response.data.upcoming_auctions;
      setAuctions(auctions);

      const stats = {};
      await Promise.all(
        auctions.map(async (auction) => {
          stats[auction.id] = await fetchPlayerStats(auction.id);
        })
      );
      setPlayerStatsMap(stats);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const todayDate = new Date().toISOString().split("T")[0];

  const getAuctionStatus = (auction, playerStats) => {
    const now = currentTime;
    const scheduledStart = new Date(`${auction.auction_date}T${auction.auction_time}`);
    const actualStart = auction.actual_start_time ? new Date(auction.actual_start_time) : null;
    const auctionEnded = localStorage.getItem(`auction_${auction.id}_ended`) === 'true';

    if (auctionEnded) return 'ended';

    const hasActivity = playerStats?.sold > 0 || playerStats?.unsold > 0;

    if (hasActivity) return 'live';

    if (now < scheduledStart) return 'not_started';

    if (actualStart && actualStart > scheduledStart) return 'delayed';

    if (!actualStart && now >= scheduledStart) return 'delayed';

    return 'not_started';
  };

  const filteredAuctions = Array.isArray(auctions)
    ? auctions
        .filter((auction) => {
          const auctionDate = auction.auction_date.split("T")[0];
          if (activeTab === "today") return auctionDate === todayDate;
          return new Date(auctionDate) >= new Date(todayDate);
        })
        .filter((auction) => getAuctionStatus(auction, playerStatsMap[auction.id]) !== 'ended')
        .sort((a, b) => {
          const dateA = new Date(a.auction_date);
          const dateB = new Date(b.auction_date);
          if (dateA < dateB) return -1;
          if (dateA > dateB) return 1;

          const timeA = new Date(`1970-01-01T${a.auction_time}`);
          const timeB = new Date(`1970-01-01T${b.auction_time}`);
          return timeA - timeB;
        })
    : [];

  const getCountdown = (date, time) => {
    const target = new Date(`${date}T${time}`);
    const diff = target - currentTime;
    if (diff <= 0) return null;

    const days = Math.floor(diff / (24 * 3600000));
    const hours = Math.floor((diff % (24 * 3600000)) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    let dayPart = days > 0 ? `${days} day${days > 1 ? 's' : ''} ` : '';
    return `${dayPart}${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="upcoming-container">
      <div className="upcoming-toggle">
        <button
          className={activeTab === "today" ? "active" : ""}
          onClick={() => setActiveTab("today")}
        >
          Today's Auctions
        </button>
        <button
          className={activeTab === "upcoming" ? "active" : ""}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming Auctions
        </button>
      </div>

      <div className="middle-line"></div>

      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading Auctions...</p>
        </div>
      )}

      <div className="auction-grid">
        {!loading && filteredAuctions.length === 0 ? (
          <p className="no-auction-msg">No auctions available.</p>
        ) : (
          !loading && filteredAuctions.map((auction) => {
            const status = getAuctionStatus(auction, playerStatsMap[auction.id]);
            const countdown = getCountdown(auction.auction_date, auction.auction_time);

            let badge = null;
            if (status === 'live') badge = <span className="badge live">🞉 Live</span>;
            else if (status === 'not_started') badge = countdown && <span className="badge waiting">{countdown}</span>;
            else if (status === 'delayed') badge = <span className="badge delayed">Delayed</span>;
            else if (status === 'ended') badge = <span className="badge ended">Ended</span>;

            return (
              <div
                key={auction.id}
                className="custom-auction-card"
                onClick={() =>
                  navigate('/join-auction', { state: { auctionCode: auction.auction_code } })
                }
              >
                <div className="top-row">
                  <div className="auction-code">
                    <strong>Code:</strong> {auction.auction_code}
                  </div>
                  <div className="auction-status-badge">{badge}</div>
                </div>

                <div className="logo-center">
                  <img
                    src={auction.auction_logo || "/default-logo.png"}
                    alt={auction.auction_name}
                    className="auction-logo-img"
                  />
                </div>

                <h3 className="auction-title">{auction.auction_name}</h3>
                <div className="middle-line-card"></div>

                <div className="auction-info-row">
                  <div className="auction-info-col">
                    <div><strong>Points:</strong> {formatIndianNumber(auction.points_per_team)}</div>
                    <div><FaCalendarAlt />{" "}
                      {new Date(auction.auction_date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </div>
                    <div><strong>Min Players:</strong> {auction.min_players_per_team || "N/A"}</div>
                  </div>

                  <div className="auction-info-col">
                    <div><FaUsers /> <strong>Total Players:</strong> {playerStatsMap[auction.id]?.total || 0}</div>
                    <div><FaClock />{" "}
                      {new Date(`1970-01-01T${auction.auction_time}`).toLocaleTimeString("en-US", {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    <div><strong>Max Players:</strong> {auction.max_players_per_team || "N/A"}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UpcomingAuction;
