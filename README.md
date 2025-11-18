# Leave Management System

A full-stack Leave Management System built with Node.js, Express, MySQL, and vanilla JavaScript.

## 🚀 Features

- Employee Registration & Login
- Admin Dashboard
- Apply for Leave (Casual, Sick, etc.)
- Admin Approve/Reject Leaves
- Leave Balance Tracking
- Leave History & Reports
- Real-time Statistics

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Frontend:** HTML5, CSS3, JavaScript
- **Authentication:** JWT

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- MySQL (v8+)

### Setup

1. **Clone the repository**
git clone https://github.com/Keshavvs123/leave-management-system.git
cd leave-management-system


2. **Install dependencies**
cd backend
npm install

3. **Setup Database**
- Create MySQL database: `lms`
- Import schema: `backend/database/DDL.txt`
- Import data: `backend/database/DML.txt`
- Import triggers: `backend/database/triggers.txt`

4. **Configure Environment**
Create `.env` file in `backend/`:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lms
PORT=5000
JWT_SECRET=your_secret_key


5. **Run Backend Server**
cd backend
npm start


6. **Run Frontend**
Open `frontend/index.html` in browser or use Live Server.

## 🔑 Default Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin123`

## 📁 Project Structure

├── backend/
│ ├── config/db.js
│ ├── routes/
│ ├── middleware/
│ └── server.js
├── frontend/
│ ├── css/
│ ├── js/
│ └── *.html
└── database/
├── DDL.txt
├── DML.txt
└── triggers.txt


## 📊 Database Schema

- **Login** - User authentication
- **User** - User information
- **Employee** - Employee details
- **Admin** - Admin accounts
- **LeaveType** - Types of leaves
- **LeaveMaster** - Leave applications
- **EmployeeLeaveBalance** - Leave balance tracking

## 👨‍💻 Author

**Keshav**  
GitHub: [@Keshavvs123](https://github.com/Keshavvs123)

## 📄 License

MIT License
