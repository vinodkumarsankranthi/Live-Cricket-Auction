import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaGavel, FaUserTie,FaHandshake } from 'react-icons/fa';
import { MdGavel } from 'react-icons/md';
import { BiSolidHand } from 'react-icons/bi';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">DASHBOARD</h2>
      </div>
      <div className="middle-line"></div>
      <div className="dashboard-card-wrapper">
        <Link to="/create-new-auction" className="dashboard-card">
          <BiSolidHand className="dashboard-card-icon" />
          <div><strong>New</strong><br />Auction</div>
        </Link>

        <Link to="/join-auction" className="dashboard-card">
          <MdGavel className="dashboard-card-icon" />
          <div><strong>Join</strong><br />Auction</div>
        </Link>

        <Link to="/my-auction" className="dashboard-card">
          <FaUserTie className="dashboard-card-icon" />
          <div><strong>My</strong><br />Auction</div>
        </Link>

        <Link to="/auction-panel" className="dashboard-card">
          <FaGavel className="dashboard-card-icon" />
          <div><strong>Auction</strong><br />Panel</div>
        </Link>

        <Link to={`/auction/fixtures`} className="dashboard-card">
          <FaHandshake className="dashboard-card-icon" />
          <div><strong>Team</strong><br />Fixtures</div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
