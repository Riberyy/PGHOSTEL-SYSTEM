# 🏠 Smart PG & Hostel Management System

A full-stack MERN application for managing PG and Hostel accommodations with role-based access for Students, Owners, and Admins.

---

## 🗂️ Project Structure

```
pg-hostel-system/
├── backend/
│   ├── config/          # Cloudinary config
│   ├── controllers/     # Business logic
│   ├── middleware/       # JWT auth middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # Express route handlers
│   ├── utils/           # Roommate matching, rent reminders
│   ├── server.js        # Entry point
│   └── .env.example     # Environment variable template
└── frontend/
    └── src/
        ├── context/     # Auth context (global state)
        ├── pages/       # student/, owner/, admin/
        ├── components/  # Layouts per role
        ├── utils/       # Axios API instance
        ├── App.js       # Routing + guards
        └── index.css    # Global design system
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for image uploads)

---

### 1. Clone / Download the project

```bash
cd pg-hostel-system
```

---

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Start the backend:
```bash
npm run dev       # development (with nodemon)
npm start         # production
```
Backend runs at: **http://localhost:5000**

---

```bash
node seed.js
```

---

### 4. Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

> The `"proxy": "http://localhost:5000"` in `frontend/package.json` forwards all `/api` calls to the backend automatically.

---


---

## ✨ Features

### Student
- Register with roommate preferences (sleep, food, lifestyle)
- Search & filter PG/Hostel by city, type, gender, price
- View property details, images, amenities, rooms
- Save properties to wishlist
- Book rooms with check-in date
- Automatic roommate matching for PG shared rooms
- Track rent payments & pay online
- Raise and track maintenance complaints
- Edit profile & roommate preferences

### Owner
- Add PG/Hostel with multi-step form + image upload
- Manage rooms (add/edit/delete)
- View tenant bookings across all properties
- Track rent payments (paid/pending/overdue)
- Handle complaints with status updates & comments
- Dashboard with stats and revenue summary

### Admin
- Approve/reject property listings with notes
- Manage all users (activate/deactivate)
- View all bookings system-wide
- Monitor all payments
- Track all complaints
- Analytics dashboard with monthly revenue chart

### Roommate Matching Algorithm
When a student books a shared PG room, the system:
1. Finds any existing confirmed tenant in that room
2. Computes a compatibility score (0–100) based on:
   - Sleep schedule match → 40 points
   - Food preference match → 30 points
   - Lifestyle match → 30 points
3. Assigns them as roommates and shows the match score

---

## 🛠️ Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React 18, React Router v6     |
| Styling   | Pure CSS (custom design system)|
| State     | React Context API             |
| Backend   | Node.js, Express.js           |
| Database  | MongoDB, Mongoose             |
| Auth      | JWT (JSON Web Tokens)         |
| Images    | Cloudinary + Multer           |
| Email     | Nodemailer (rent reminders)   |
| Scheduler | node-cron                     |

---

---

## 📦 Dependencies

### Backend
- express, mongoose, bcryptjs, jsonwebtoken
- cloudinary, multer, multer-storage-cloudinary
- nodemailer, node-cron, cors, dotenv

### Frontend
- react, react-router-dom
- axios
- react-hot-toast
- react-icons

---

## 🗃️ Database Models

- **User** – name, email, password (hashed), role, preferences (roommate matching)
- **Property** – name, type, gender, address, images, amenities, rooms[], pricing, status
- **Booking** – student, property, roomNumber, roommate, matchScore, rentAmount
- **Payment** – booking, student, amount, type, month, status, dueDate
- **Complaint** – raisedBy, property, title, category, priority, status, comments[]

---

*Built with the MERN Stack for Smart PG & Hostel Management*
