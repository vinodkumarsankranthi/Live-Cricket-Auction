import React, { useState,useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
 import { baseURL } from "../../http";
import { FaArrowLeft } from "react-icons/fa";
import { Edit, Delete, PhotoCamera } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import { customAlert } from "../SweetAlertCommon/Custom";
import '../New Auction/New Auction.css';
import Cropper from "../Cropper/Cropper";
import "./AddTeams.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export default function AddTeam() {
const navigate = useNavigate();
const { state } = useLocation();
const auctionId = state?.auctionId;
const [openCropper, setOpenCropper] = useState(false);
const [selectedImage, setSelectedImage] = useState(null);
const [pointsPerTeam, setPointsPerTeam] = useState(null);  

useEffect(() => {
  if (!auctionId) {
    customAlert("Error", "Auction ID is missing. Redirecting back.", "error");
    navigate("/my-auction");
  } else {
    // Fetch auction to get points_per_team
    axios.get(`${baseURL}/auction/${auctionId}`)
      .then(res => setPointsPerTeam(res.data.auction.points_per_team))
      .catch(err => {
        console.error(err);
        customAlert("Error", "Failed to fetch auction details.", "error");
      });
  }
}, [auctionId, navigate]);

  const [isHoveredImage, setIsHoveredImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [team, setTeam] = useState({
    team_logo: null,
    team_name: '',
    team_short_name: '',
    owner_name: '',
    owner_contact: '',
    amount_available: '',
    details: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeam({ ...team, [name]: value });
  };

const [phoneError, setPhoneError] = useState("");

const handlePhoneChange = (phone, data) => {
  const formattedPhone = `+${data.dialCode} ${phone.slice(data.dialCode.length)}`;
  const phoneNumber = parsePhoneNumberFromString(formattedPhone);

  if (phoneNumber && phoneNumber.isValid()) {
    setPhoneError(""); // Clear error if valid
    setTeam({ ...team, owner_contact: formattedPhone.trim() });
  } else {
    setPhoneError("Phone Number is Invalid.");
    setTeam({ ...team, owner_contact: formattedPhone.trim() }); 
  }
};


const handleFileSelectForCropper = (e) => {
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
  setPreviewImage(dataUrl);
  setOpenCropper(false);
  customAlert('Selected Team Logo', 'New Team Logo is selected and cropped.', 'info');

  // Convert dataURL to File object to send in FormData
  const blob = dataURLToBlob(dataUrl);
  const file = new File([blob], "team_logo.png", { type: "image/png" });
  setTeam(prev => ({ ...prev, team_logo: file }));
};

// Utility: Convert Data URL to Blob
const dataURLToBlob = (dataUrl) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
};



  const handleDeleteImage = () => {
    setTeam({ ...team, team_logo: null });
    setPreviewImage(null);
    customAlert("Logo Removed", "Team logo has been removed.", "info");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!team.team_name || !team.team_short_name || !team.owner_name || !team.owner_contact || !team.amount_available|| phoneError) {
      customAlert("Missing Fields", "Please fill all required fields marked with *.", "warning");
      return;
    }
    if (parseInt(team.amount_available) > parseInt(pointsPerTeam)) {
  customAlert("Invalid Amount", `Amount Available cannot exceed Points per Team ${pointsPerTeam}`, "warning");
  return;
}
    const formData = new FormData();
    Object.entries(team).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("auction_id", auctionId);

    try {
      await axios.post(`${baseURL}/add-team`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await customAlert("Success!", "Team added successfully.", "success");
      navigate('/auction/teams', { state: { auctionId: auctionId } });
    } catch (error) {
      console.error(error);
      customAlert("Error", "Failed to add team. Please try again later.", "error");
    }
  };

  const handleSaveAndAddNew = async (e) => {
    e.preventDefault();

    if (!team.team_name || !team.team_short_name || !team.owner_name || !team.owner_contact || !team.amount_available ||phoneError) {
      customAlert("Missing Fields", "Please fill all required fields marked with *.", "warning");
      return;
    }
    if (parseInt(team.amount_available) > parseInt(pointsPerTeam)) {
      customAlert("Invalid Amount", `Amount Available cannot exceed Points per Team ${pointsPerTeam}`, "warning");
  return;
}

    const formData = new FormData();
    Object.entries(team).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("auction_id", auctionId);

    try {
      await axios.post(`${baseURL}/add-team`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await customAlert("Success!", "Team added successfully. Ready to add another!", "success");
      setTeam({
        team_logo: null,
        team_name: '',
        team_short_name: '',
        owner_name: '',
        owner_contact: '',
        amount_available: '',
        details: '',
      });
      setPreviewImage(null);
    } catch (error) {
      console.error(error);
      customAlert("Error", "Failed to add team. Please try again later.", "error");
    }
  };

  return (
    <div className="AddTeam-container">
      <div className="AddTeam-header">
        <button className="AddTeam-back-btn" onClick={() => navigate('/auction/teams', { state: { auctionId: auctionId } })}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="AddTeam-title">Add Teams</h2>
      </div>

      <form onSubmit={handleSubmit} className="AddTeam-form">
        <div className="AddTeam-row">
          <div
            className="AddTeam-logo-wrapper"
            onMouseEnter={() => setIsHoveredImage(true)}
            onMouseLeave={() => setIsHoveredImage(false)}
          >
            <div className="AddTeam-logo-container">
              <img
                src={previewImage || "/default-logo.png"}
                alt="Team Logo"
                className="AddTeam-logo"
              />
              <div className={`AddTeam-icon-wrap ${isHoveredImage ? "visible" : ""}`}>
                {team.team_logo ? (
                  <>
                    <Tooltip title="Edit Logo" arrow>
                      <label htmlFor="logo-upload" className="AddTeam-icon edit">
                        <Edit />
                      </label>
                    </Tooltip>
                    <Tooltip title="Delete Logo" arrow>
                      <div className="AddTeam-icon delete" onClick={handleDeleteImage}>
                        <Delete />
                      </div>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title="Add Logo" arrow>
                    <label htmlFor="logo-upload" className="AddTeam-icon add">
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
              onChange={handleFileSelectForCropper}
              hidden
             />
          </div>

          <div className="AddTeam-input-group">
            <label>Team Name *</label>
            <input
              type="text"
              name="team_name"
              value={team.team_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="AddTeam-input-group">
            <label>Short Name *</label>
            <input
              type="text"
              name="team_short_name"
              value={team.team_short_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="AddTeam-row">
          <div className="AddTeam-input-group">
            <label>Owner Name *</label>
            <input
              type="text"
              name="owner_name"
              value={team.owner_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="AddTeam-input-group">
            <label>Owner Contact Number *</label>
            <PhoneInput
              country={"in"}
              value={team.owner_contact}
              onChange={handlePhoneChange}
              inputStyle={{ width: "100%" }}
              inputProps={{ required: true }}
            />
            {phoneError && (
              <div style={{ color: "red", fontSize: "small", marginTop: "1px" }}>
                {phoneError}
              </div>
            )}
          </div>
        </div>

        <div className="AddTeam-row">
          <div className="AddTeam-input-group">
            <label>Auction Amount Available *</label>
            <input
              type="number"
              name="amount_available"
              value={team.amount_available}
              onChange={handleChange}
              required
            />
          </div>

          <div className="AddTeam-input-group">
            <label>Details</label>
            <textarea
              name="details"
              value={team.details}
              onChange={handleChange}
              rows="4"
              style={{ resize: "none" }}
            />
          </div>
        </div>

        <div className="AddTeam-buttons">
          <button type="submit" className="AddTeam-submit">Save Team</button>
          <button type="button" className="AddTeam-submit" onClick={handleSaveAndAddNew}>
            Save and Add New
          </button>
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
