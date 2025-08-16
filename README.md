# 🏏 Live Cricket Auction

**Live Cricket Auction** is a web application that simulates the **IPL-style player auction** experience.  
It includes **real-time bidding**, **sold/unsold status**, **user and admin logins**, **match fixtures**, and much more — all designed to bring the excitement of cricket auctions online.

---

## 📌 Features

- **User Login & Registration**
- **Admin Login & Auction Management**
- Real-time **Bidding System**
- **Sold / Unsold Player Status**
- Match Fixtures & Scheduling
- Player Details & Stats
- Fully responsive design
- Tech Stack:
  - **Frontend:** HTML, CSS, JavaScript, React.js, Material UI
  - **Backend:** PHP, Laravel, MySQL
  - **Other:** Node.js, Composer, Axios

---

## 📂 Project Structure

root/
│── backend/ # Laravel API & Database
│── frontend/ # React.js frontend

---

## ⚙️ Installation & Setup
# 🏏 Live Cricket Auction – Detailed Installation Guide

This guide explains **step-by-step** how to install and run the **Live Cricket Auction** project on your computer.  
It covers **backend (Laravel + MySQL)** and **frontend (React.js)** setup, plus **importing a sample database**.

---

### Prerequisites

Before starting, make sure you have the following installed:

- **PHP** >= 8.x
- **Composer**
- **MySQL** (XAMPP)
- **Node.js** & **npm**
- **Git**

### **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/live-cricket-auction.git
   live-cricket-auction

### **---------------Steps----------------**

## 1️⃣ Backend Setup (Laravel + MySQL)

1. **Go to backend folder**

   - cd backend

2. **Install Dependencies**
   - composer install
   - npm install

3. **Configure Environment**
   - Copy .env.example to .env
   - Paste the following (update DB details if needed):

   APP_NAME=Laravel
   APP_ENV=local
   APP_KEY=base64:MDHFSRWrIfQ1124do1+3Mppc44TRywRO0hQUaViGTC8=
   APP_DEBUG=true
   APP_URL=http://localhost

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=live_cricket_auction  
   DB_USERNAME=root
   DB_PASSWORD=

   MAIL_MAILER=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=livecricketauction@gmail.com
   MAIL_PASSWORD="rolp fhim qsti nbwx"
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=livecricketauction@gmail.com
   MAIL_FROM_NAME="Live Cricket Auction"

4. **Generate Application Key**
   - php artisan key:generate

5. **Run Database Migrations**
   - php artisan migrate
   - php artisan db:seed   # If you have seeders
     
6. **Import the sample database**
     Open phpMyAdmin or MySQL CLI
     Create a database:
   
      - CREATE DATABASE live_cricket_auction;

    Import the provided sample_database.sql file into this database.

7. **Start Laravel Server**
   - php artisan serve

     Backend will run at: "http://127.0.0.1:8000"
     
## 2️⃣ Frontend Setup (React.js)

1. **Navigate to Frontend Folder**
   - cd ../frontend

2. **Install Dependencies**
   - npm install
     
3.**Start the React Development Server**
   - npm start

Frontend will run at: http://localhost:3000

## 🔗 Connecting Frontend & Backend

Make sure backend server (php artisan serve) is running.


## 🛠️ Common Issues & Fixes

1. **Port Already in Use**

   Change the port in .env for Laravel or use:
   - php artisan serve --port=8080

2. **CORS Issues**

   Install Laravel CORS package:
   - composer require fruitcake/laravel-cors
     
   Configure it in config/cors.php.

3. **MySQL Connection Error**

     Ensure MySQL is running and .env DB details match your local setup.
