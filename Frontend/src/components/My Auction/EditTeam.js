import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { baseURL } from "../../http";
import { FaArrowLeft } from 'react-icons/fa';
import { Edit, Delete, PhotoCamera } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import '../New Auction/New Auction.css';
import './EditTeam.css';
import { customAlert } from "../SweetAlertCommon/Custom";
import Cropper from "../Cropper/Cropper";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export default function EditTeam() {
  const location = useLocation();
  const { auctionId, teamId } = location.state || {};
  const navigate = useNavigate();
  const [pointsPerTeam, setPointsPerTeam] = useState(null);
  const [isHoveredImage, setIsHoveredImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openCropper, setOpenCropper] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ loading state

  const [team, setTeam] = useState({
    team_logo: null,
    team_name: '',
    team_short_name: '',
    owner_name: '',
    owner_contact: '',
    amount_available: '',
    details: '',
  });

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await axios.get(`${baseURL}/auction/${auctionId}/teams/${teamId}`);
        const data = response.data.team;
        setTeam(prevTeam => ({
          ...prevTeam,
          team_name: data.team_name,
          team_short_name: data.team_short_name,
          owner_name: data.owner_name,
          owner_contact: data.owner_contact,
          amount_available: data.amount_available,
          details: data.details,
        }));
        if (data.team_logo) {
          setPreviewImage(`http://localhost:8000${data.team_logo}`);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
        customAlert("Error", "Failed to load team data.", "error");
      }

      try {
        const response = await axios.get(`${baseURL}/auction/${auctionId}`);
        setPointsPerTeam(response.data.auction.points_per_team);
      } catch (error) {
        console.error("Error fetching auction data:", error);
        customAlert("Error", "Failed to fetch auction details.", "error");
      }

      setLoading(false); // ✅ hide loading after all data is fetched
    };

    fetchTeam();
  }, [auctionId, teamId]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeam(prevTeam => ({ ...prevTeam, [name]: value }));
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

  const handleCroppedImage = (dataUrl) => {
    setPreviewImage(dataUrl);
    const blob = dataURLtoBlob(dataUrl);
    const file = new File([blob], "cropped_logo.png", { type: "image/png" });
    setTeam(prev => ({ ...prev, team_logo: file }));
    customAlert('Team Logo Updated', 'Updated New Team Logo and cropped.', 'info');
  };

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], {type:mime});
  };

  const handleDeleteImage = () => {
    if (previewImage) {
      customAlert("Confirm", "Are you sure you want to remove this logo?", "warning").then((result) => {
        if (result.isConfirmed) {
          setTeam(prevTeam => ({ ...prevTeam, team_logo: null }));
          setPreviewImage(null);
          customAlert("Deleted", "Team logo removed.", "info");
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(team.amount_available) > parseFloat(pointsPerTeam)) {
      customAlert("Invalid Amount", `Amount Available cannot exceed Points per Team ${pointsPerTeam}`, "warning");
      return;
    }

    const formData = new FormData();
    formData.append('team_name', team.team_name);
    formData.append('team_short_name', team.team_short_name);
    formData.append('owner_name', team.owner_name);
    formData.append('owner_contact', team.owner_contact);
    formData.append('amount_available', team.amount_available);
    formData.append('details', team.details);
    if (team.team_logo) {
      formData.append('team_logo', team.team_logo);
    }

    try {
      await axios.post(`${baseURL}/auction/${auctionId}/teams/${teamId}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      customAlert("Success", "Team updated successfully!", "success").then(() => {
        navigate(`/auction/teams`, { state: { auctionId } });
      });
    } catch (error) {
      console.error('Error updating team:', error);
      customAlert("Error", "Failed to update team. Please try again.", "error");
    }
  };

  if (loading) {
  return (
    <div className="spinner-container"> 
      <div className="spinner"></div> 
        <p>Loading Team details...</p>
    </div>
  );
}

  return (
    <div className="EditTeam-container">
      <div className="EditTeam-header">
        <button className="EditTeam-back-btn" onClick={() => navigate('/auction/teams', { state: { auctionId } })}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="EditTeam-title">Edit Team</h2>
      </div>

      <form onSubmit={handleSubmit} className="EditTeam-form">
        <div className="EditTeam-row">
          <div
            className="EditTeam-logo-wrapper"
            onMouseEnter={() => setIsHoveredImage(true)}
            onMouseLeave={() => setIsHoveredImage(false)}
          >
            <div className="EditTeam-logo-container">
              <img
                src={previewImage || "/default-logo.png"}
                alt="Team Logo"
                className="EditTeam-logo"
              />
              <div className={`EditTeam-icon-wrap ${isHoveredImage ? "visible" : ""}`}>
                {previewImage ? (
                  <>
                    <Tooltip title="Edit Logo" arrow>
                      <label htmlFor="logo-upload" className="EditTeam-icon edit">
                        <Edit fontSize="small" />
                      </label>
                    </Tooltip>
                    <Tooltip title="Delete Logo" arrow>
                      <div className="EditTeam-icon delete" onClick={handleDeleteImage}>
                        <Delete fontSize="small" />
                      </div>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title="Add Logo" arrow>
                    <label htmlFor="logo-upload" className="EditTeam-icon add">
                      <PhotoCamera fontSize="small" />
                    </label>
                  </Tooltip>
                )}
              </div>
            </div>
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleFileSelect} // ✅ Use fileSelect
              hidden
            />
          </div>

          <div className="EditTeam-input-group">
            <label>Team Name *</label>
            <input type="text" name="team_name" value={team.team_name} onChange={handleChange} required />
          </div>

          <div className="EditTeam-input-group">
            <label>Short Name *</label>
            <input type="text" name="team_short_name" value={team.team_short_name} onChange={handleChange} required />
          </div>
        </div>

        <div className="EditTeam-row">
          <div className="EditTeam-input-group">
            <label>Owner Name *</label>
            <input type="text" name="owner_name" value={team.owner_name} onChange={handleChange} required />
          </div>

          <div className="EditTeam-input-group">
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

        <div className="EditTeam-row">
          <div className="EditTeam-input-group">
            <label>Amount Available *</label>
            <input type="number" name="amount_available" value={team.amount_available} onChange={handleChange} required />
          </div>

          <div className="EditTeam-input-group">
            <label>Details</label>
            <textarea name="details" value={team.details} onChange={handleChange} rows="4" style={{ resize: "none" }} />
          </div>
        </div>

        <div className="EditTeam-buttons">
          <button type="submit" className="EditTeam-submit">Update Team</button>
        </div>
      </form>

      {/* ✅ Cropper Integration */}
      <Cropper
        open={openCropper}
        setOpen={setOpenCropper}
        setCroppedImageDataUrl={handleCroppedImage}
        initialImage={selectedImage}
      />
    </div>
  );
}
