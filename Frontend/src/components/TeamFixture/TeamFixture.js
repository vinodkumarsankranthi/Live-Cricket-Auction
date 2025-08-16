import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { baseURL } from "../../http";
import './TeamFixture.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { customAlert } from '../SweetAlertCommon/Custom';
import { FaCalendarAlt, FaArrowLeft, FaTrash } from 'react-icons/fa';
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const TeamFixture = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFixtureType, setSelectedFixtureType] = useState('all');
  const [manualFixtures, setManualFixtures] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamEditInfo, setTeamEditInfo] = useState({ fixtureIndex: null, teamSide: '' });
  const [originalFixtureBackup, setOriginalFixtureBackup] = useState(null);
  const [teamsChanged, setTeamsChanged] = useState({ team1: false, team2: false });
  const [allFixtures, setAllFixtures] = useState([]);
  const [showTeamSelectModal, setShowTeamSelectModal] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectAllTeams, setSelectAllTeams] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const auction_id = location.state?.auctionId;

  const [loadingTeams, setLoadingTeams] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [savingIndex, setSavingIndex] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [confirmingFixture, setConfirmingFixture] = useState(false);



  useEffect(() => {
    if (!auction_id) {
      customAlert("Missing Data", "Auction ID not provided.", "error");
      navigate("/dashboard");
      return;
    }
  }, [auction_id, navigate]);

  const fetchTeams = useCallback(async () => {
    try {
      const response = await axios.get(`${baseURL}/auction/${auction_id}/teams`);
      setTeams(response.data.teams || []);
    } catch (error) {
      customAlert('Error', 'Failed to fetch teams.', 'error');
    }
  }, [auction_id]);

const fetchFixtures = useCallback(async () => {
  try {
    const res = await axios.get(`${baseURL}/auction/${auction_id}/fixtures`);
    const fetchedFixtures = res.data.fixtures || [];
    setAllFixtures(fetchedFixtures);

    if (selectedFixtureType === 'all') {
      setManualFixtures(fetchedFixtures);  // Show all fixtures without filtering
    } else if (selectedFixtureType === 'manual') {
      setManualFixtures(fetchedFixtures.filter(fix => fix.fixture_type === 'manual'));
    } else {
      setManualFixtures(fetchedFixtures.filter(fix => fix.fixture_type === selectedFixtureType));
    }
  } catch (err) {
    console.error(err);
  }
}, [auction_id, selectedFixtureType]);



const generateFixtures = () => {
  if (selectedFixtureType === 'manual') return;

  if (teams.length < 2) {
    customAlert("Error", "At least two teams required to generate fixtures.", "error");
    return;
  }

  setShowTeamSelectModal(true);
};

const toggleTeamSelection = (teamId) => {
  if (selectedTeams.includes(teamId)) {
    setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    setSelectAllTeams(false);
  } else {
    const newSelection = [...selectedTeams, teamId];
    setSelectedTeams(newSelection);
    if (newSelection.length === teams.length) setSelectAllTeams(true);
  }
};

const toggleSelectAllTeams = () => {
  if (selectAllTeams) {
    setSelectedTeams([]);
    setSelectAllTeams(false);
  } else {
    setSelectedTeams(teams.map(team => team.id));
    setSelectAllTeams(true);
  }
};

const confirmTeamSelectionAndGenerate = async () => {
  if (selectedTeams.length < 2) {
    customAlert("Error", "Please select at least two teams to generate fixtures.", "error");
    return;
  }

  try {
    setLoading(true);
    await axios.post(`${baseURL}/auction/${auction_id}/generate-fixtures`, {
      fixture_type: selectedFixtureType,
      team_ids: selectedTeams
    });

    customAlert("Success", "Fixtures generated successfully.", "success");
    fetchFixtures();
    setShowTeamSelectModal(false);
    setSelectedTeams([]);         // reset selected teams
    setSelectAllTeams(false);     // reset select all checkbox
  } catch (err) {
    customAlert("Error", "Failed to generate fixtures.", "error");
  } finally {
    setLoading(false);
  }
};



const handleFixtureTypeChange = (event) => {
  setSelectedFixtureType(event.target.value);
  setEditIndex(null);
};

  const handleInputChange = (idx, field, value) => {
    const updatedFixtures = [...manualFixtures];
    updatedFixtures[idx] = {
      ...updatedFixtures[idx],
      [field]: value
    };
    setManualFixtures(updatedFixtures);
  };

  const openTeamModal = (fixtureIndex, teamSide) => {
  setTeamEditInfo({ fixtureIndex, teamSide });
  setTeamsChanged((prev) => ({ ...prev, [teamSide]: true }));
  setShowTeamModal(true);
};
 
const resetEditState = () => {
  setEditIndex(null);
  setOriginalFixtureBackup(null);
  setTeamsChanged({ team1: false, team2: false });
};


  const selectTeamForFixture = (team) => {
    const updatedFixtures = [...manualFixtures];
    const { fixtureIndex, teamSide } = teamEditInfo;

    updatedFixtures[fixtureIndex] = {
      ...updatedFixtures[fixtureIndex],
      [`${teamSide}_id`]: team.id,
      [`${teamSide}_name`]: team.team_name,
      [`${teamSide}_logo`]: team.team_logo ? `http://localhost:8000${team.team_logo}` : null
    };
    setManualFixtures(updatedFixtures);
    setShowTeamModal(false);
  };

const saveFixture = async (idx) => {
  try {
    const updatedFixture = manualFixtures[idx];
    const fixturePayload = {
      id: updatedFixture.id,
      date: updatedFixture.date,
      time: updatedFixture.time,
      venue: updatedFixture.venue,
      overs: updatedFixture.overs,
      fixture_type: 'manual',
    };

    if (teamsChanged.team1) {
      fixturePayload.team1_id = updatedFixture.team1_id;
    }

    if (teamsChanged.team2) {
      fixturePayload.team2_id = updatedFixture.team2_id;
    }

    // Backend-side validation
    if ((fixturePayload.team1_id && fixturePayload.team2_id) && fixturePayload.team1_id === fixturePayload.team2_id) {
      customAlert("warning", "Both teams are the same. Please select different teams.", "warning");
      return;
    }

        // Validate required fields: date, time, venue
    if (!updatedFixture.date || !updatedFixture.time || !updatedFixture.venue?.trim()) {
      customAlert("Missing Information", "Please fill in date, time, and venue.", "warning");
      return;
    }

    // Optional: Validate overs (e.g., must be positive)
    const overs = parseInt(updatedFixture.overs);
    if (!overs || overs < 1) {
      customAlert("Invalid Overs", "Please enter a valid number of overs (minimum 1).", "warning");
      return;
    }

    await axios.post(`${baseURL}/auction/${auction_id}/save-manual-fixtures`, {
      fixtures: [fixturePayload],
    });

    customAlert("Success", `Match-${idx + 1} updated successfully.`, "success");
    resetEditState();
    fetchFixtures();
  } catch (err) {
    // Check if backend returned the specific error for same teams
    if (err.response && err.response.status === 422 && err.response.data.error) {
      customAlert("warning","Both teams are the same. Please select different teams.", "warning");
    } else {
      customAlert("Error", "Failed to save fixture.", "error");
    }
  }
};

  const deleteFixture = async (fixtureId) => {
    try {
      await axios.delete(`${baseURL}/auction/${auction_id}/fixture/${fixtureId}`);
      customAlert("Deleted", "Fixture deleted successfully", "success");
      fetchFixtures();
    } catch (err) {
      customAlert("Error", "Could not delete fixture", "error");
    }
  };

  const resetFixtures = async () => {
    try {
      await axios.delete(`${baseURL}/auction/${auction_id}/fixtures/reset`);
      setManualFixtures([]);
      customAlert("Success", "Fixtures reset successfully.", "success");
    } catch (err) {
      customAlert("Error", "Failed to reset fixtures.", "error");
    }
  };

  useEffect(() => {
  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTeams(), fetchFixtures()]);
    } finally {
      setLoading(false);
    }
  };

  loadInitialData();
}, [fetchTeams, fetchFixtures]);

return (
  <div className="fixture-container">
    <div className="fixture-header">
      <button className="AuctionFixture-back-btn" onClick={() => navigate(-1)}><FaArrowLeft /> Back</button>
      <h2 className="teamslist-title">Team Schedules</h2>
    </div>

    <div className="fixture-teams-list">
      <h2>➤ All Teams</h2>
      <div className="teams-container">
        {loadingTeams ? (
          <div className="spinner-container"> 
            <div className="spinner"></div> 
             <p>Loading Teams...</p>
           </div>
        ) : (
          teams.map((team, index) => (
            <div key={team.id} className="team-entry">
              <span className="team-number">{index + 1}.</span>
              <div className="team-details">
                <img
                  src={team.team_logo ? `http://localhost:8000${team.team_logo}` : '/default-logo.png'}
                  alt={team.team_name}
                  className="teamfixter-logo"
                />
                <span className="team-name">{team.team_name} ({team.team_short_name})</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    <div className="fixture-type-select">
      <label><h2>➤ Fixtures : </h2></label>
      <select value={selectedFixtureType} onChange={handleFixtureTypeChange}>
        <option value="all">All Matches</option>
        <option value="manual">Manual</option>
        <option value="round_robin">Round Robin</option>
        <option value="double_round_robin">Double Round Robin</option>
        <option value="knockout">Knockout</option>
        <option value="playoff">Playoff</option>
        <option value="best_of">Best of Three Matches</option>
        <option value="triangular">Triangular</option>
        <option value="quadrangular">Quadrangular</option>
        <option value="royal_rumble">Royal Rumble</option>
      </select>
      <input
        type="text"
        placeholder="Search teams ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="fixture-search-match-input"
      />
      {selectedFixtureType !== 'all' && selectedFixtureType !== 'manual' && (
        <>
          <button onClick={generateFixtures} disabled={loading} className="fixture-generate-btn">
            {loading ? "Generating..." : "Generate Fixtures"}
          </button>
          {loading }
        </>
      )}
      <button onClick={resetFixtures} disabled={resetting} className="fixture-reset-btn">
        {resetting ? "Resetting..." : "Reset All Fixtures"}
      </button>
    </div>

    <div className="text-field">
      <h4>• You Can Add Matches Manually or Select Fixture Type to generate the matches Automatically.</h4>
      <h4>• After generating the Fixtures Click on the team logos in edit mode to manually change the teams for a match.</h4>
      <h4>• On changing or editing fixture data, the fixture is treated as a manual type and moved under the Manual fixtures category.</h4>
      <h4>• Generating fixtures after switching to a new fixture type (e.g., Round Robin) will reset and replace existing fixture data.</h4>
    </div>

    <div className="fixture-table">
      {manualFixtures.length === 0 ? (
        <p>No fixtures found.</p>
      ) : (
        manualFixtures
          .filter((fixture, index) => {
            const searchLower = searchTerm.toLowerCase();
            const matchNumber = `match ${index + 1}`;
            const date = fixture.date ? new Date(fixture.date) : null;
            const day = date ? date.toLocaleDateString('en-IN', { weekday: 'long' }).toLowerCase() : '';
            const dateStr = date ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase() : '';
            return (
              matchNumber.includes(searchLower) ||
              fixture.team1_name?.toLowerCase().includes(searchLower) ||
              fixture.team2_name?.toLowerCase().includes(searchLower) ||
              fixture.venue?.toLowerCase().includes(searchLower) ||
              dateStr.includes(searchLower) ||
              day.includes(searchLower)
            );
          })
          .map((fixture, idx) => (
            <div className="fixture-row" key={fixture.id || idx}>
              <div className="match-number">
                <span className="match-label">MATCH {idx + 1}</span>
                <div className="match-date">
                  {fixture.date ? new Date(fixture.date).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'Date TBD'}
                </div>
                <div className="match-time">
                  <FaCalendarAlt />{' '}
                  {fixture.time ? new Date(`2000-01-01T${fixture.time}`).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }).replace(/am|pm/i, match => match.toUpperCase()) : 'Time TBD'}
                </div>
              </div>

              <div className="match-details">
                <span
                  className="team-name"
                  onClick={() => editIndex === idx ? openTeamModal(idx, 'team1') : null}
                  style={{ cursor: editIndex === idx ? 'pointer' : 'default' }}
                  title={editIndex === idx ? "Click to change Team 1" : ""}
                >
                  <img src={fixture.team1_logo || '/default-logo.png'} alt="logo" className="team-logo" />
                  {fixture.team1_name}
                </span>
                <span className="vs-text">v/s</span>
                <span
                  className="team-name"
                  onClick={() => editIndex === idx ? openTeamModal(idx, 'team2') : null}
                  style={{ cursor: editIndex === idx ? 'pointer' : 'default' }}
                  title={editIndex === idx ? "Click to change Team 2" : ""}
                >
                  {fixture.team2_name}
                  <img src={fixture.team2_logo || '/default-logo.png'} alt="logo" className="team-logo" />
                </span>
              </div>

              <div className="match-meta">{fixture.venue || 'Venue TBD'} | {fixture.overs || '20'} overs</div>

              <div className="edit-icon" onClick={() => {
                setOriginalFixtureBackup(JSON.parse(JSON.stringify(manualFixtures[idx])));
                setEditIndex(idx);
              }}>✎</div>

              <div className="delete-icon" onClick={() => deleteFixture(fixture.id)}>
                {deletingIndex === idx ? <span className="spinner-mini" /> : <FaTrash />}
              </div>

              {editIndex === idx && (
                <div className="inline-edit">
                  <div className="inline-edit-teams">
                    <div className="team-picker" onClick={() => openTeamModal(idx, 'team1')} />
                    <div className="team-picker" onClick={() => openTeamModal(idx, 'team2')} />
                  </div>
                  <input type="date" value={fixture.date || ''} onChange={(e) => handleInputChange(idx, 'date', e.target.value)} />
                  <input type="time" value={fixture.time || ''} onChange={(e) => handleInputChange(idx, 'time', e.target.value)} />
                  <input type="text" placeholder="Venue" value={fixture.venue || ''} onChange={(e) => handleInputChange(idx, 'venue', e.target.value)} />
                  <input type="number" placeholder="Overs" min={1} value={fixture.overs || ''} onChange={(e) => handleInputChange(idx, 'overs', e.target.value)} />
                  <button onClick={() => saveFixture(idx)} disabled={savingIndex === idx} className="save-fixtures-btn">
                    {savingIndex === idx ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => {
                    const isNewFixture = !manualFixtures[idx]?.id;
                    if (isNewFixture) {
                      const updatedFixtures = [...manualFixtures];
                      updatedFixtures.splice(idx, 1);
                      setManualFixtures(updatedFixtures);
                    } else if (originalFixtureBackup) {
                      const updatedFixtures = [...manualFixtures];
                      updatedFixtures[idx] = originalFixtureBackup;
                      setManualFixtures(updatedFixtures);
                    }
                    setEditIndex(null);
                    setOriginalFixtureBackup(null);
                  }} className="cancel-edit-btn"> Cancel</button>
                </div>
              )}
            </div>
          ))
      )}
    </div>

    {selectedFixtureType === 'manual' && (
      <button onClick={() => {
        setManualFixtures([...manualFixtures, {
          date: '', time: '', venue: '', overs: '',
          team1_id: null, team2_id: null,
          team1_name: '', team1_logo: '', team2_logo: ''
        }]);
        setEditIndex(manualFixtures.length);
      }} className="fixture-manual-generate-btn">✚ Add Match</button>
    )}

    {showTeamModal && (
      <div className="team-modal-overlay" onClick={() => setShowTeamModal(false)}>
        <div className="team-modal" onClick={(e) => e.stopPropagation()}>
          <IconButton className="fixture-model-close" onClick={() => setShowTeamModal(false)}>
            <CloseIcon className="fixture-model-closex" />
          </IconButton>
          <div className="modal-team-list">
            {loadingTeams ? (
              <div className="spinner-container"> 
               <div className="spinner"></div> 
                <p>Loading Teams...</p>
               </div>
            ) : (
              teams.map((team, index) => (
                <div key={team.id} className="modal-team-row" onClick={() => selectTeamForFixture(team)}>
                  <span className="team-index">{index + 1}.</span>
                  <img
                    src={team.team_logo ? `http://localhost:8000${team.team_logo}` : '/default-logo.png'}
                    alt={team.team_name}
                    className="team-logo-box"
                  />
                  <span className="team-name">{team.team_name} - ({team.team_short_name})</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )}

    {showTeamSelectModal && (
      <div className="team-modal-overlay-two" onClick={() => setShowTeamSelectModal(false)}>
        <div className="team-modal-two" onClick={(e) => e.stopPropagation()}>
          <IconButton className="fixture-model-close-two" onClick={() => {
            setShowTeamSelectModal(false);
            setSelectedTeams([]);
            setSelectAllTeams(false);
          }}>
            <CloseIcon className="fixture-model-closex-two" />
          </IconButton>
          <h3>Select Teams for {selectedFixtureType} Fixture</h3>
          <div className="modal-team-list-two">
            <div className="modal-team-row cursor-pointer-two" onClick={toggleSelectAllTeams}>
              <input
                type="checkbox"
                checked={selectAllTeams}
                onChange={toggleSelectAllTeams}
                onClick={(e) => e.stopPropagation()}
                className="checkbox-two"
              />
              <strong>Select All</strong>
            </div>
            {teams.map((team, index) => (
              <div key={team.id} className="modal-team-row-two" onClick={() => toggleTeamSelection(team.id)}>
                <input
                  type="checkbox"
                  checked={selectedTeams.includes(team.id)}
                  onChange={() => toggleTeamSelection(team.id)}
                  className="checkbox-two"
                />
                <span className="team-index">{index + 1}.</span>
                <img
                  src={team.team_logo ? `http://localhost:8000${team.team_logo}` : '/default-logo.png'}
                  alt={team.team_name}
                  className="team-logo-box-two"
                />
                <span className="team-name-two">{team.team_name} - ({team.team_short_name})</span>
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button onClick={confirmTeamSelectionAndGenerate} disabled={confirmingFixture} className="fixture-generate-btn">
              {confirmingFixture ? "Generating..." : `Generate ${selectedFixtureType}`}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};
export default TeamFixture;