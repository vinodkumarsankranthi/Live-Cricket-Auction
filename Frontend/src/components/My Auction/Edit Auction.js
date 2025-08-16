import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { baseURL } from "../../http";
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { Edit, Delete, PhotoCamera } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { customAlert } from "../SweetAlertCommon/Custom";
import Cropper from "../Cropper/Cropper"; // 🔁 Import Cropper
import './Edit Auction.css';

const EditAuction = () => {
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [updatedLogo, setUpdatedLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [isHoveredLogo, setIsHoveredLogo] = useState(false);
  const [openCropper, setOpenCropper] = useState(false); // 🔁 Cropper state
  const [selectedImage, setSelectedImage] = useState(null); // 🔁 Image to crop
  const today = new Date().toISOString().split('T')[0];
  const { state } = useLocation();
  const auctionId = state?.auctionId;
  const [loading, setLoading] = useState(true); // ✅ new

  const formatIndianNumber = (num) => {
    if (!num) return '';
    return parseInt(num).toLocaleString('en-IN');
  };

  useEffect(() => {
  if (!auctionId) {
    customAlert('Error', 'No auction ID provided.', 'error');
    navigate('/my-auction');
    return;
  }

  axios.get(`${baseURL}/auction/${auctionId}`)
    .then((res) => {
      setAuction(res.data.auction);
      setUpdatedData(res.data.auction);
      setPreviewLogo(res.data.auction.auction_logo);
    })
    .catch((err) => {
      console.error(err);
      customAlert('Error', 'Failed to fetch auction.', 'error');
    })
    .finally(() => {
      setLoading(false); // ✅ hide loader
    });
}, [auctionId]);


  // 🔁 Handle file selection to open cropper
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    e.target.value = ''; // Reset input
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

  const handleCroppedImage = (dataUrl) => {
    setPreviewLogo(dataUrl);

    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], "cropped-logo.png", { type: mimeString });

    setUpdatedLogo(file);
    customAlert('Logo Updated', 'Updated New logo and cropped.', 'info');
  };

  const handleDeleteLogo = () => {
    setUpdatedLogo(null);
    setPreviewLogo('/default-logo.png');
    customAlert('Logo Removed', 'Auction logo has been removed.', 'info');
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    const {
      min_players_per_team,
      max_players_per_team,
      base_bid,
      bid_increase_by,
      points_per_team
    } = updatedData;

    const minPlayers = parseInt(min_players_per_team, 10);
    const maxPlayers = parseInt(max_players_per_team, 10);
    const baseBid = parseInt(base_bid);
    const bidIncrease = parseInt(bid_increase_by);
    const totalPoints = parseInt(points_per_team);

    if (minPlayers > maxPlayers) {
      customAlert('Validation Error', 'Minimum players should be less than maximum players.', 'warning');
      return;
    }

    if (baseBid >= totalPoints || bidIncrease >= totalPoints) {
      customAlert('Validation Error', 'Base Bid and Bid Increase By must both be less than Points per Team.', 'warning');
      return;
    }

    const formData = new FormData();

    const cleanedData = { ...updatedData };
    if (cleanedData.auction_time) {
      const timeParts = cleanedData.auction_time.split(':');
      cleanedData.auction_time = `${timeParts[0]}:${timeParts[1]}`;
    }

    Object.entries(cleanedData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (updatedLogo) {
      formData.append('auction_logo', updatedLogo);
    }

    formData.append('_method', 'PUT');

    axios.post(`${baseURL}/update-auction/${auctionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(() => {
        customAlert('Success', 'Auction updated successfully!', 'success')
          .then(() => navigate('/my-auction'));
      })
      .catch((error) => {
        console.error('Update failed:', error.response?.data || error);
        customAlert('Error', 'Failed to update auction.', 'error');
      });
  };

  if (loading) {
  return (
    <div className="spinner-container"> 
      <div className="spinner"></div> 
        <p>Loading Auctions details...</p>
    </div>
  );
}

  return (
    <div className="all-container">
      <div className="edit-auction-header">
        <button className="all-back-button" onClick={() => navigate('/my-auction')}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="all-auction-title">Edit Auction</h2>
      </div>

      <form className="edit-auction-form" onSubmit={handleUpdate}>
        <div className="edit-auction-row1">
          <div
            className="edit-auction-logo-wrapper"
            onMouseEnter={() => setIsHoveredLogo(true)}
            onMouseLeave={() => setIsHoveredLogo(false)}
          >
            <div className="edit-auction-image-wrapper">
              <img
                src={previewLogo || '/default-logo.png'}
                alt="Auction Logo"
                className="edit-auction-logo"
              />
              <div className={`edit-auction-icon-container ${isHoveredLogo ? 'visible' : ''}`}>
                {(previewLogo && previewLogo !== '/default-logo.png') ? (
                  <>
                    <Tooltip title="Edit Logo" arrow>
                      <label htmlFor="logo-upload" className="edit-auction-icon edit-auction-edit-icon">
                        <Edit />
                      </label>
                    </Tooltip>
                    <Tooltip title="Delete Logo" arrow>
                      <div className="edit-auction-icon edit-auction-delete-icon" onClick={handleDeleteLogo}>
                        <Delete />
                      </div>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title="Add Logo" arrow>
                    <label htmlFor="logo-upload" className="edit-auction-icon edit-auction-add-icon">
                      <PhotoCamera />
                    </label>
                  </Tooltip>
                )}
              </div>
            </div>
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleLogoChange}
              hidden
            />
          </div>

          <div className="edit-auction-field">
            <label>Auction Name *</label>
            <input
              type="text"
              value={updatedData.auction_name || ''}
              onChange={(e) => setUpdatedData({ ...updatedData, auction_name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="edit-auction-row">
          <div className="edit-auction-field">
            <label>Auction Season *</label>
            <input
              type="text"
              value={updatedData.auction_season || ''}
              onChange={(e) => setUpdatedData({ ...updatedData, auction_season: e.target.value })}
              required
            />
          </div>
          <div className="edit-auction-field">
            <label>Auction Date *</label>
            <input
              type="date"
              min={today}
              value={updatedData.auction_date || ''}
              onChange={(e) => setUpdatedData({ ...updatedData, auction_date: e.target.value })}
              required
            />
          </div>
          <div className="edit-auction-field">
            <label>Auction Time *</label>
            <input
              type="time"
              value={updatedData.auction_time || ''}
              onChange={(e) => setUpdatedData({ ...updatedData, auction_time: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="edit-auction-row">
          {[
            { label: 'Points per Team', key: 'points_per_team' },
            { label: 'Base Bid', key: 'base_bid' },
            { label: 'Bid Increase By', key: 'bid_increase_by' }
          ].map(({ label, key }) => (
            <div className="edit-auction-field" key={key}>
              <label>{label} *</label>
              <input
                type="text"
                value={formatIndianNumber(updatedData[key])}
                onFocus={(e) => e.target.value = updatedData[key]}
                onBlur={(e) => setUpdatedData({ ...updatedData, [key]: e.target.value.replace(/[^0-9]/g, '') })}
                onChange={(e) => setUpdatedData({ ...updatedData, [key]: e.target.value.replace(/[^0-9]/g, '') })}
                required
              />
            </div>
          ))}
        </div>

        <div className="edit-auction-row">
          {[
            { label: 'Min Players per Team', key: 'min_players_per_team' },
             { label: 'Max Players per Team', key: 'max_players_per_team' }
          ].map(({ label, key }) => (
            <div className="edit-auction-field" key={key}>
              <label>{label} *</label>
              <input
                type="text"
                value={formatIndianNumber(updatedData[key])}
                onFocus={(e) => e.target.value = updatedData[key]}
                onBlur={(e) => setUpdatedData({ ...updatedData, [key]: e.target.value.replace(/[^0-9]/g, '') })}
                onChange={(e) => setUpdatedData({ ...updatedData, [key]: e.target.value.replace(/[^0-9]/g, '') })}
                required
              />
            </div>
          ))}
        </div>

        <button type="submit" className="edit-auction-submit">Update Auction</button>
      </form>

      {/* 🔁 Cropper Modal */}
      <Cropper
        open={openCropper}
        setOpen={setOpenCropper}
        setCroppedImageDataUrl={handleCroppedImage}
        initialImage={selectedImage}
      />
    </div>
  );
};

export default EditAuction;
