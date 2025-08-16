import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';
import { Edit, Delete, PhotoCamera } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { customAlert } from "../SweetAlertCommon/Custom";
import { baseURL } from "../../http";
import './New Auction.css';
import Cropper from "../Cropper/Cropper";

const NewAuction = () => {
  const navigate = useNavigate();

  const [auctionLogo, setAuctionLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [isHoveredLogo, setIsHoveredLogo] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [auctionName, setAuctionName] = useState('');
  const [auctionSeason, setAuctionSeason] = useState('');
  const [auctionDate, setAuctionDate] = useState('');
  const [auctionTime, setAuctionTime] = useState('');
  const [pointsPerTeam, setPointsPerTeam] = useState('');
  const [baseBid, setBaseBid] = useState('');
  const [bidIncreaseBy, setBidIncreaseBy] = useState('');
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState('');
  const [minPlayersPerTeam, setMinPlayersPerTeam] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [openCropper, setOpenCropper] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleCroppedImage = (dataUrl) => {
    setPreviewLogo(dataUrl);

    // Convert DataURL to Blob
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    setAuctionLogo(blob);
    customAlert('Selected Logo', 'New Auction logo is selected and cropped.', 'info');
  };

  const handleDeleteLogo = () => {
    setAuctionLogo(null);
    setPreviewLogo(null);
    customAlert('Logo Removed', 'Auction logo has been removed successfully.', 'info');
  };
  
const handleFileSelect = (e) => {
  const file = e.target.files[0];
  e.target.value = ''; 
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(null);
      setTimeout(() => {
        setSelectedImage(reader.result);
        setOpenCropper(true);
      }, 50);
    };
    reader.readAsDataURL(file);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      customAlert('Please Log In', 'You must be logged in to create an auction.', 'error');
      return;
    }

    const minPlayers = Number(minPlayersPerTeam);
    const maxPlayers = Number(maxPlayersPerTeam);
    const points = Number(pointsPerTeam);
    const base = Number(baseBid);
    const increment = Number(bidIncreaseBy);
    const token = localStorage.getItem('token');

    if (minPlayers > maxPlayers) {
      return customAlert('Invalid Input', 'Minimum players must be less than maximum players.', 'warning');
    }

    if (base >= points || increment >= points) {
      return customAlert('Invalid Input', 'Base Bid and Bid Increase By must be less than Points per Team.', 'warning');
    }

    const formData = new FormData();
    formData.append('auction_logo', auctionLogo);
    formData.append('auction_name', auctionName);
    formData.append('auction_season', auctionSeason);
    formData.append('auction_date', auctionDate);
    formData.append('auction_time', auctionTime);
    formData.append('points_per_team', pointsPerTeam);
    formData.append('base_bid', baseBid);
    formData.append('bid_increase_by', bidIncreaseBy);
    formData.append('max_players_per_team', maxPlayersPerTeam);
    formData.append('min_players_per_team', minPlayersPerTeam);

    try {
      const response = await axios.post(`${baseURL}/new-auction`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        customAlert('Success', 'Auction created successfully!', 'success').then(() => {
          navigate('/dashboard');
        });
      } else {
        customAlert('Failed', 'Failed to create auction.', 'error');
      }
    } catch (error) {
      console.error(error);
      customAlert('Error', 'Error occurred while creating the auction.', 'error');
    }
  };

  return (
    <div className="all-container">
      <input
        type="file"
        id="logo-file-input"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <Cropper
        open={openCropper}
        setOpen={setOpenCropper}
        setCroppedImageDataUrl={handleCroppedImage}
        initialImage={selectedImage}
      />

      <div className="new-auction-header">
        <button className="all-back-button" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="all-auction-title">Create a New Auction</h2>
      </div>

      <form onSubmit={handleSubmit} className="new-auction-form">
        <div className="new-auction-row1">
          <div
            className="new-auction-logo-wrapper"
            onMouseEnter={() => setIsHoveredLogo(true)}
            onMouseLeave={() => setIsHoveredLogo(false)}
          >
            <div className="new-auction-logo-container">
              <img src={previewLogo || '/default-logo.png'} alt="Auction Logo" className="new-auction-logo-img" />
              <div className={`new-auction-icon-overlay ${isHoveredLogo ? 'visible' : ''}`}>
                {auctionLogo ? (
                  <>
                    <Tooltip title="Edit Logo" arrow>
                      <div className="new-auction-icon edit" onClick={() => document.getElementById("logo-file-input").click()}>
                        <Edit />
                      </div>
                    </Tooltip>
                    <Tooltip title="Delete Logo" arrow>
                      <div className="new-auction-icon delete" onClick={handleDeleteLogo}>
                        <Delete />
                      </div>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title="Add Logo" arrow>
                    <div className="new-auction-icon add" onClick={() => document.getElementById("logo-file-input").click()}>
                      <PhotoCamera />
                    </div>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          <div className="new-auction-input-wrapper">
            <label>Auction Name *</label>
            <input
              type="text"
              placeholder="Auction Name"
              value={auctionName}
              onChange={(e) => setAuctionName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="new-auction-row">
          <div className="new-auction-input-wrapper">
            <label>Auction Season *</label>
            <input
              type="text"
              placeholder="Auction Season"
              value={auctionSeason}
              onChange={(e) => setAuctionSeason(e.target.value)}
              required
            />
          </div>
          <div className="new-auction-input-wrapper">
            <label>Auction Date *</label>
            <input
              type="date"
              value={auctionDate}
              onChange={(e) => setAuctionDate(e.target.value)}
              min={getTodayDate()}
              required
            />
          </div>
          <div className="new-auction-input-wrapper">
            <label>Auction Time *</label>
            <input
              type="time"
              value={auctionTime}
              onChange={(e) => setAuctionTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="new-auction-row">
          <div className="new-auction-input-wrapper">
            <label>Points per Team *</label>
            <input
              type="number"
              placeholder="Points"
              value={pointsPerTeam}
              onChange={(e) => setPointsPerTeam(e.target.value)}
              required
            />
          </div>
          <div className="new-auction-input-wrapper">
            <label>Base Bid *</label>
            <input
              type="number"
              placeholder="Base Price"
              value={baseBid}
              onChange={(e) => setBaseBid(e.target.value)}
              required
            />
          </div>
          <div className="new-auction-input-wrapper">
            <label>Bid Increase By *</label>
            <input
              type="number"
              placeholder="Bid Increase"
              value={bidIncreaseBy}
              onChange={(e) => setBidIncreaseBy(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="new-auction-row">
          <div className="new-auction-input-wrapper">
            <label>Minimum Players per Team *</label>
            <input
              type="number"
              placeholder="Min Players"
              value={minPlayersPerTeam}
              onChange={(e) => setMinPlayersPerTeam(e.target.value)}
              required
            />
          </div>
          <div className="new-auction-input-wrapper">
            <label>Maximum Players per Team *</label>
            <input
              type="number"
              placeholder="Max Players"
              value={maxPlayersPerTeam}
              onChange={(e) => setMaxPlayersPerTeam(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="new-auction-submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default NewAuction;
