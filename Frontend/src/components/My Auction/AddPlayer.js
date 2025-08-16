import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { baseURL } from "../../http";
import { FaArrowLeft } from "react-icons/fa";
import { Edit, Delete, PhotoCamera } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import { customAlert } from "../SweetAlertCommon/Custom";
import Cropper from "../Cropper/Cropper"; // Import your cropper component
import "./AddPlayer.css";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { parsePhoneNumberFromString } from 'libphonenumber-js';


export default function AddPlayer() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const auction_id = state?.auctionId;

  const [isHoveredImage, setIsHoveredImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openCropper, setOpenCropper] = useState(false);

  const [player, setPlayer] = useState({
    name: "",
    mobile: "",
    age: "",
    jersey_name: "",
    jersey_number: "",
    jersey_style: "",
    jersey_size: "",
    batting_style: "",
    bowling_style: "",
    playing_style: "",
    base_price: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlayer((prevPlayer) => ({ ...prevPlayer, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setOpenCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const [phoneError, setPhoneError] = useState('');

  const handlePhoneChange = (phone, data) => {
  const formattedPhone = `+${data.dialCode}${phone.slice(data.dialCode.length)}`;
  const phoneNumber = parsePhoneNumberFromString(formattedPhone);

  if (phoneNumber && phoneNumber.isValid()) {
    setPhoneError('');
    setPlayer((prev) => ({ ...prev, mobile: formattedPhone }));
  } else {
    setPhoneError('Phone Number is Invalid.');
    setPlayer((prev) => ({ ...prev, mobile: formattedPhone })); // still update to preserve value
  }
};


  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleCroppedImage = (dataUrl) => {
    const file = dataURLtoFile(dataUrl, 'cropped-image.png');
    setPlayer((prevPlayer) => ({ ...prevPlayer, image: file }));
    setPreviewImage(dataUrl);
    customAlert('Selected Player profile', 'New Player Image is selected and cropped.', 'info');
  };

  const handleDeleteImage = () => {
    setPlayer((prevPlayer) => ({ ...prevPlayer, image: null }));
    setPreviewImage(null);
    customAlert("Image Removed", "Player image has been removed.", "info");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await savePlayer();
    navigate('/auction/players', { state: { auctionId: auction_id } });
  };

  const handleSaveAndAddNew = async (e) => {
    e.preventDefault();
    await savePlayer();
    setPlayer({
      name: "",
      mobile: "",
      age: "",
      jersey_name: "",
      jersey_number: "",
      jersey_style: "",
      jersey_size: "",
      batting_style: "",
      bowling_style: "",
      playing_style: "",
      base_price: "",
      image: null,
    });
    setPreviewImage(null);
  };

  const savePlayer = async () => {
    if (!player.name || !player.mobile || !player.age || !player.base_price) {
      customAlert("Missing Fields", "Please fill all required fields marked with *.", "warning");
      return;
    }
     
    if (phoneError) {
      customAlert("Invalid Phone", "Please enter a valid phone number.", "error");
      return;
    }

    const formData = new FormData();
    Object.entries(player).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });
    formData.append("auction_id", auction_id);

    try {
      await axios.post(`${baseURL}/players`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await customAlert("Success", "Player added successfully!", "success");
    } catch (error) {
      console.error(error);
      customAlert("Error", "Failed to add player. Please try again later.", "error");
    }
  };

  return (
    <div className="addplayer-container">
      <div className="addplayer-header">
        <button className="addplayer-back-btn" onClick={() => navigate('/auction/players', { state: { auctionId: auction_id } })}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="addplayer-title">Add Player</h2>
      </div>

      <form onSubmit={handleSubmit} className="addplayer-form">
        <div className="addplayer-row">
          <div
            className="addplayer-img-wrapper"
            onMouseEnter={() => setIsHoveredImage(true)}
            onMouseLeave={() => setIsHoveredImage(false)}
          >
            <div className="addplayer-img-container">
              <img
                src={previewImage || "/default-logo.png"}
                alt="Player"
                className="addplayer-img"
              />
              <div className={`addplayer-img-overlay ${isHoveredImage ? "visible" : ""}`}>
                {player.image ? (
                  <>
                    <Tooltip title="Edit Image" arrow>
                      <label htmlFor="image-upload" className="addplayer-img-edit">
                        <Edit />
                      </label>
                    </Tooltip>
                    <Tooltip title="Delete Image" arrow>
                      <div className="addplayer-img-delete" onClick={handleDeleteImage}>
                        <Delete />
                      </div>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title="Add Image" arrow>
                    <label htmlFor="image-upload" className="addplayer-img-add">
                      <PhotoCamera />
                    </label>
                  </Tooltip>
                )}
              </div>
            </div>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageSelect}
              hidden
            />
          </div>

          <div className="addplayer-col">
            <label>Player Name *</label>
            <input
              type="text"
              placeholder="Player's Name"
              name="name"
              value={player.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="addplayer-row">
          <div className="addplayer-col">
            <label>Mobile *</label>
            <PhoneInput
              country={'in'}
              value={player.mobile}
              onChange={handlePhoneChange}
              inputProps={{ required: true }}
              inputStyle={{ width: '100%' }}
            />
            {phoneError && (
              <div style={{ color: 'red', fontSize: 'small', marginTop: '2px' }}>
                {phoneError}
              </div>
            )}
          </div>

          <div className="addplayer-col">
            <label>Age *</label>
            <input
              type="number"
              placeholder="Age"
              name="age"
              value={player.age}
              onChange={handleChange}
              required
            />
          </div>
          <div className="addplayer-col">
            <label>Base Price *</label>
            <input
              type="number"
              placeholder="Base Price"
              name="base_price"
              value={player.base_price}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="addplayer-row">
          <div className="addplayer-col">
            <label>Jersey Name</label>
            <input
              type="text"
              name="jersey_name"
              value={player.jersey_name}
              onChange={handleChange}
              placeholder="Jersey Name"
            />
          </div>
          <div className="addplayer-col">
            <label>Jersey Number</label>
            <input
              type="text"
              name="jersey_number"
              value={player.jersey_number}
              onChange={handleChange}
              placeholder="Jersey Number"
            />
          </div>
          <div className="addplayer-col">
            <label>Jersey Style</label>
            <input
              type="text"
              name="jersey_style"
              value={player.jersey_style}
              onChange={handleChange}
              placeholder="Full / Half Hands"
            />
          </div>
          <div className="addplayer-col">
            <label>Jersey Size</label>
            <input
              type="text"
              name="jersey_size"
              value={player.jersey_size}
              onChange={handleChange}
              placeholder="Size"
            />
          </div>
        </div>

        <div className="addplayer-row">
          <div className="addplayer-col">
            <label>Playing Style</label>
            <select name="playing_style" value={player.playing_style} onChange={handleChange}>
              <option value="">Select</option>
              <option value="All-rounder">All-rounder</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="Wicket-keeper">Wicket-keeper</option>
            </select>
          </div>
          <div className="addplayer-col">
            <label>Batting Style</label>
            <select name="batting_style" value={player.batting_style} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Right-hand">Right-hand</option>
              <option value="Left-hand">Left-hand</option>
            </select>
          </div>
          <div className="addplayer-col">
            <label>Bowling Style</label>
            <select name="bowling_style" value={player.bowling_style} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Right-arm fast">Right-arm fast</option>
              <option value="Left-arm fast">Left-arm fast</option>
              <option value="Off-spinner">Off-spinner</option>
              <option value="Leg-spinner">Leg-spinner</option>
              <option value="Left-arm orthodox">Left-arm orthodox</option>
              <option value="Left-arm unorthodox">Left-arm unorthodox</option>
            </select>
          </div>
        </div>

        <div className="addplayer-btn-group">
          <button type="submit" className="addplayer-btn">Save Player</button>
          <button type="button" className="addplayer-btn" onClick={handleSaveAndAddNew}>
            Save and Add New
          </button>
        </div>
      </form>

      {/* Cropper Modal */}
      <Cropper
        open={openCropper}
        setOpen={setOpenCropper}
        setCroppedImageDataUrl={handleCroppedImage}
        initialImage={selectedImage}
      />
    </div>
  );
}
