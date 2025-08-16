import React from 'react';
import './Home Page.css';
import { BiSolidHand } from 'react-icons/bi';
import { MdGavel, MdOutlineSchedule, MdOutlineReplayCircleFilled } from 'react-icons/md';
import { FaUserTie, FaHandshake } from 'react-icons/fa6';
import { GiTeamIdea, GiPodiumWinner } from 'react-icons/gi';
import { AiOutlineDashboard } from 'react-icons/ai';
import { RiAuctionLine } from 'react-icons/ri';

const HomePage = () => {
  return (
 <div className="home-outer-container">
  <div className="home-content-wrapper">
    <div className="home-image">
      <img src={process.env.PUBLIC_URL + '/homebackground2.png'} alt="Auction Banner" />
    </div>
      <div className="home-top">
       <h1>Welcome to,</h1> 
       <h2> Live Cricket Auction</h2>
        <h3>Join the latest cricket auctions and bid for your favorite players and teams.</h3>
         <p><strong>•</strong> Before entering the live auction, make sure to add the auction details, teams, and players.</p>
         <p><strong>•</strong> Feel free to join the live auction once it's available.</p>
         <p><strong>•</strong> Easily schedule matches on your preferred date and time.</p>
         <p><strong>•</strong> All bids are final and Teams can be auctioned individually</p>
         <p><strong>•</strong> Each team starts with the <strong>assigned auction points</strong>.</p>
         <p><strong>•</strong> Teams <strong>cannot bid</strong> if they lack funds to meet the <strong>minimum player </strong>requirement.</p>
         <p><strong>•</strong> Filter players by <strong>Sold, Unsold, Role, Base Price, or Random</strong>.</p>
         <p><strong>•</strong> Unsold players can be <strong>re-auctioned</strong> later.</p>
         <p><strong>•</strong> Clicking <strong>"End Auction"</strong> will <strong>permanently close</strong> the auction for all teams. <strong>This action cannot be undone</strong>.</p>
      </div>
  </div>
  <div className="home-body"> 
  <h1 >Advanced Features</h1> 
  <div className="middle-line-home"></div>
  <div className="feature-cards-wrapper">
    <div className="feature-card">
  <RiAuctionLine className="feature-icon" />
  <h3>Live Bidding</h3>
  <p>Experience real-time bidding with dynamic price updates and visual excitement.</p>
</div>

<div className="feature-card">
  <AiOutlineDashboard className="feature-icon" />
  <h3>Manager Dashboard</h3>
  <p>Control your team’s strategy, finances, and bidding from a sleek control panel.</p>
</div>

<div className="feature-card">
  <BiSolidHand className="feature-icon" />
  <h3>Quick Auctions</h3>
  <p>Join fast-paced mini-auctions for emerging players and game-changing deals.</p>
</div>

<div className="feature-card">
  <GiTeamIdea className="feature-icon" />
  <h3>Team Synergy</h3>
  <p>Evaluate team chemistry with synergy ratings before confirming player deals.</p>
</div>

<div className="feature-card">
  <MdOutlineSchedule className="feature-icon" />
  <h3>Team Scheduler</h3>
  <p>Plan match schedules effortlessly and manage league fixtures with calendar tools.</p>
</div>

<div className="feature-card">
  <FaUserTie className="feature-icon" />
  <h3>Manage Teams & Players</h3>
  <p>Easily add new teams, assign managers, and expand your auction pool with detailed player profiles and stats.</p>
</div>

<div className="feature-card">
  <MdOutlineReplayCircleFilled className="feature-icon" />
  <h3>Re-Auction Players</h3>
  <p>Quickly re-auction unsold or disputed players in special bidding rounds.</p>
</div>

<div className="feature-card">
  <FaHandshake className="feature-icon" />
  <h3>Sales Overview</h3>
  <p>Get complete insights into sold players in teams, including stats, assignments, and performance reports.</p>
</div>

  </div>
</div>

  </div>
  );
}

export default HomePage;
