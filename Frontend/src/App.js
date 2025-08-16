import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { customAlert } from './components/SweetAlertCommon/Custom';
import HomePage from './components/Home Page/Home Page';
import Dashboard from './components/Dahboard/Dashboard';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import NewAuction from './components/New Auction/New Auction';
import JoinAuction from './components/Join Auction/Join Auction';
import MyAuction from './components/My Auction/My Auction';
import EditAuction from './components/My Auction/Edit Auction';
import PlayerList from './components/My Auction/PlayersList';
import AddPlayer from './components/My Auction/AddPlayer';
import EditPlayer from './components/My Auction/EditPlayer';
import TeamsList from './components/My Auction/TeamsList';
import AddTeam from './components/My Auction/AddTeams';
import EditTeam from './components/My Auction/EditTeam';
import AuctionPanel from './components/Auction Panel/Auction Panel';
import LiveAuction from './components/Auction Panel/LiveAuction';
import TeamPoints from './components/Auction Panel/TeamPoints';
import TeamPlayers from './components/Auction Panel/TeamPlayers';
import AuctionInfoPage from './components/Auction Panel/AuctionInfoPage';
import { AuthContext } from './contexts/AuthContext';
import ContactUs from './components/Profile/ContactUs';
import LoginSignup from './components/Profile/LoginSignup'; 
import Profile from './components/Profile/Profile';          
import TeamFixture from './components/TeamFixture/TeamFixture';
import AuctionFixture from './components/TeamFixture/AuctionFixture';
import AuctionPreview from './components/Join Auction/AuctionPreview';
import AuctionPlayerPreview from './components/Join Auction/AuctionPlayerPreview';
import AuctionTeamPreview from './components/Join Auction/AuctionTeamPreview';
import AuctionInfoPreview from './components/Join Auction/AuctionInfoPreview';
import UpcomingAuction from './components/UpcominAuction/UpcominAuction';
import Pricing from './components/Pricing/Pricing';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';

function App() {
  const { loading, user } = useContext(AuthContext);

  if (loading) return <div></div>; // Wait for auth check to finish

  const ProtectedRoute = ({ element }) => {
    const location = useLocation();

    if (!user && location.pathname !== '/auth') {
      customAlert("Unauthorized", "Please login or register to continue.", "info");
      return <Navigate to="/auth" replace />;
    }

    return element;
  };

  return (
    <Router>
      <div className="App">
        <Header />
        <div className="mid-page">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/upcoming-auctions" element={<UpcomingAuction />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/auth" element={<LoginSignup />} />
            <Route path="/join-auction" element={<JoinAuction />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            {/* Protected Routes */}
            <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
            <Route path="/create-new-auction" element={<ProtectedRoute element={<NewAuction />} />} />
            <Route path="/my-auction" element={<ProtectedRoute element={<MyAuction />} />} />
            <Route path="/edit-auction" element={<ProtectedRoute element={<EditAuction />} />} />
            <Route path="/auction/players" element={<ProtectedRoute element={<PlayerList />} />} />
            <Route path="/auction/players/add" element={<ProtectedRoute element={<AddPlayer />} />} />
            <Route path="/auction/players/edit" element={<ProtectedRoute element={<EditPlayer />} />} />
            <Route path="/auction/teams" element={<ProtectedRoute element={<TeamsList />} />} />
            <Route path="/auction/teams/add" element={<ProtectedRoute element={<AddTeam />} />} />
            <Route path="/auction/teams/edit" element={<ProtectedRoute element={<EditTeam />} />} />
            <Route path="/auction-panel" element={<ProtectedRoute element={<AuctionPanel />} />} />
            <Route path="/auction/live" element={<ProtectedRoute element={<LiveAuction />} />} />
            <Route path="/auction/info" element={<ProtectedRoute element={<AuctionInfoPage />} />} />
            <Route path="/auction/fixtures" element={<ProtectedRoute element={<AuctionFixture />} />} />
            <Route path="/auction/team-fixture" element={<ProtectedRoute element={<TeamFixture />} />} />
            <Route path="/auction/preview" element={<ProtectedRoute element={<AuctionPreview />} />} />
            <Route path="/auction/players-preview" element={<ProtectedRoute element={<AuctionPlayerPreview />} />} />
            <Route path="/auction/teams-preview" element={<ProtectedRoute element={<AuctionTeamPreview />} />} />
            <Route path="/auction/info-preview" element={<ProtectedRoute element={<AuctionInfoPreview />} />} />
            <Route path="/auction/teampoints-preview" element={<ProtectedRoute element={<TeamPoints />} />} />
            <Route path="/auction/team/players-preview" element={<ProtectedRoute element={<TeamPlayers />} />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}


export default App;
