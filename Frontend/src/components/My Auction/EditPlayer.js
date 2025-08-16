import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
 import { baseURL } from "../../http";
import { FaArrowLeft } from "react-icons/fa";
import { Edit, Delete, PhotoCamera } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import { customAlert } from "../SweetAlertCommon/Custom";
import Cropper from "../Cropper/Cropper";
import "./EditPlayer.css";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export default function EditPlayer() {
  const { state } = useLocation();
  const playerId = state?.playerId;
  const auctionId = state?.auctionId;
  const navigate = useNavigate();
  const [isHoveredImage, setIsHoveredImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formattedBasePrice, setFormattedBasePrice] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [openCropper, setOpenCropper] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Format numbers in Indian style (e.g., 1,00,000)
  const formatIndianNumber = (num) => {
    const n = parseInt(num, 10);
    if (isNaN(n)) return "";
    return n.toLocaleString("en-IN");
  };

  useEffect(() => {
  setLoading(true);
  axios.get(`${baseURL}/players/show/${playerId}`)
    .then((res) => {
      const data = res.data;
      setPlayer({
        name: data.name || "",
        mobile: data.mobile || "",
        age: data.age || "",
        jersey_name: data.jersey_name || "",
        jersey_number: data.jersey_number || "",
        jersey_style: data.jersey_style || "",
        jersey_size: data.jersey_size || "",
        batting_style: data.batting_style || "",
        bowling_style: data.bowling_style || "",
        playing_style: data.playing_style || "",
        base_price: data.base_price || "",
        image: null,
      });
      setFormattedBasePrice(formatIndianNumber(data.base_price || 0));
      setPreviewImage(data.image ? `http://localhost:8000/storage/${data.image}` : null);
    })
    .catch((error) => {
      console.error(error);
      customAlert("Error", "Failed to load player data.", "error");
    })
    .finally(() => {
      setLoading(false);
    });
}, [playerId]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "base_price") {
      const rawValue = value.replace(/[^0-9]/g, "");
      setPlayer({ ...player, base_price: rawValue });
      setFormattedBasePrice(formatIndianNumber(rawValue));
    } else {
      setPlayer({ ...player, [name]: value });
    }
  };

const [phoneError, setPhoneError] = useState('');

const handleFileChange = (e) => {
  const file = e.target.files[0];
  e.target.value = ''; // Reset file input
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
  // Convert base64 to File object for uploading
  const byteString = atob(dataUrl.split(',')[1]);
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });
  const file = new File([blob], 'cropped-image.jpg', { type: mimeString });

  setPreviewImage(dataUrl);
  setPlayer((prev) => ({ ...prev, image: file }));
 customAlert('Player Updated', 'Updated New Player Image and cropped.', 'info');
};

  const handleDeleteImage = () => {
    if (previewImage) {
      customAlert("Confirm", "Are you sure you want to remove this image?", "warning").then((result) => {
        if (result.isConfirmed) {
          setPlayer({ ...player, image: null });
          setPreviewImage(null);
          customAlert("Deleted", "Player image removed.", "info");
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.entries(player).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      await axios.post(`${baseURL}/players/update/${playerId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      customAlert("Success", "Player updated successfully!", "success").then(() => {
        navigate(`/auction/players`, { state: { auctionId } });
      });
    } catch (error) {
      console.error(error);
      customAlert("Error", "Error updating player. Please try again.", "error");
    }
  };
   
if (loading) {
  return (
    <div className="spinner-container"> 
      <div className="spinner"></div> 
        <p>Loading Player details...</p>
    </div>
  );
}

  return (
    <div className="editplayer-container">
      <div className="editplayer-header">
        <button className="editplayer-back-btn" onClick={() => navigate(`/auction/players`, { state: { auctionId } })}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="editplayer-title">Edit Player</h2>
      </div>

      <form onSubmit={handleSubmit} className="editplayer-form">
        <div className="editplayer-row">
          <div
            className="editplayer-img-wrapper"
            onMouseEnter={() => setIsHoveredImage(true)}
            onMouseLeave={() => setIsHoveredImage(false)}
          >
            <div className="editplayer-img-container">
              <img src={previewImage || "/default-logo.png"} alt="Player" className="editplayer-img" />
              <div className={`editplayer-img-overlay ${isHoveredImage ? "visible" : ""}`}>
                {previewImage ? (
                  <>
                    <Tooltip title="Edit Image" arrow>
                      <label htmlFor="image-upload" className="editplayer-img-edit">
                        <Edit />
                      </label>
                    </Tooltip>
                    <Tooltip title="Delete Image" arrow>
                      <div className="editplayer-img-delete" onClick={handleDeleteImage}>
                        <Delete />
                      </div>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title="Add Image" arrow>
                    <label htmlFor="image-upload" className="editplayer-img-add">
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
              onChange={handleFileChange}
              hidden
            />
          </div>

          <div className="editplayer-col">
            <label>Player Name *</label>
            <input type="text" name="name" value={player.name} onChange={handleChange} required />
          </div>
        </div>

        <div className="editplayer-row">
          <div className="editplayer-col">
            <label>Mobile *</label>
            <PhoneInput
              country={'in'}
              value={player.mobile}
              onChange={(phone, data) => {
                const formattedPhone = `+${data.dialCode}${phone.slice(data.dialCode.length)}`;
                const phoneNumber = parsePhoneNumberFromString(formattedPhone);

                if (phoneNumber && phoneNumber.isValid()) {
                  setPhoneError('');
                  setPlayer({ ...player, mobile: formattedPhone });
                } else {
                  setPhoneError('Invalid phone number');
                  setPlayer({ ...player, mobile: formattedPhone });
                }
              }}
              inputStyle={{ width: '100%' }}
              required
            />
            {phoneError && (
              <div style={{ color: 'red', fontSize: 'small', marginTop: '1px' }}>
                {phoneError}
              </div>
            )}
          </div>
          
          <div className="editplayer-col">
            <label>Age *</label>
            <input type="number" name="age" value={player.age} onChange={handleChange} required />
          </div>
          <div className="editplayer-col">
            <label>Base Price *</label>
            <input
              type="text"
              name="base_price"
              value={formattedBasePrice}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="editplayer-row">
          <div className="editplayer-col">
            <label>Jersey Name</label>
            <input type="text" name="jersey_name" value={player.jersey_name} onChange={handleChange} />
          </div>
          <div className="editplayer-col">
            <label>Jersey Number</label>
            <input type="text" name="jersey_number" value={player.jersey_number} onChange={handleChange} />
          </div>
          <div className="editplayer-col">
            <label>Jersey Style</label>
            <input type="text" name="jersey_style" value={player.jersey_style} onChange={handleChange} />
          </div>
          <div className="editplayer-col">
            <label>Jersey Size</label>
            <input type="text" name="jersey_size" value={player.jersey_size} onChange={handleChange} />
          </div>
        </div>

        <div className="editplayer-row">
          <div className="editplayer-col">
            <label>Playing Style</label>
            <select name="playing_style" value={player.playing_style} onChange={handleChange}>
              <option value="">Select</option>
              <option value="All-rounder">All-rounder</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="Wicket-keeper">Wicket-keeper</option>
            </select>
          </div>
          <div className="editplayer-col">
            <label>Batting Style</label>
            <select name="batting_style" value={player.batting_style} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Right-hand">Right-hand</option>
              <option value="Left-hand">Left-hand</option>
            </select>
          </div>
          <div className="editplayer-col">
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
           <button type="submit" className="editplayer-btn">Update Player</button>
        </div>
      </form>
      <Cropper
       open={openCropper}
       setOpen={setOpenCropper}
       setCroppedImageDataUrl={handleCroppedImage}
       initialImage={selectedImage}
      />
    </div>
  );
}
