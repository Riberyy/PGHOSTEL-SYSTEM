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

Edit `.env` with your credentials:
```env
MONGO_URI=mongodb://localhost:27017/pg_hostel_db
JWT_SECRET=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Start the backend:
```bash
npm run dev       # development (with nodemon)
npm start         # production
```
Backend runs at: **http://localhost:5000**

---

### 3. Seed Demo Users

Create a file `backend/seed.js` and run it once:

```js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.deleteMany({ email: { $in: ['admin@pg.com','owner@pg.com','student@pg.com'] } });
  await User.create([
    { name:'Admin User',   email:'admin@pg.com',   password:'admin123',   phone:'9000000001', role:'admin' },
    { name:'Owner Raj',    email:'owner@pg.com',   password:'owner123',   phone:'9000000002', role:'owner' },
    { name:'Student Priya',email:'student@pg.com', password:'student123', phone:'9000000003', role:'student',
      preferences:{ sleepSchedule:'early_bird', foodPreference:'vegetarian', lifestyle:'studious', gender:'female' } },
  ]);
  console.log('✅ Demo users created');
  process.exit(0);
});
```

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

## 👥 Demo Credentials

| Role    | Email             | Password   |
|---------|-------------------|------------|
| Admin   | admin@pg.com      | admin123   |
| Owner   | owner@pg.com      | owner123   |
| Student | student@pg.com    | student123 |

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

## 📡 API Endpoints

### Auth
| Method | Endpoint              | Access  |
|--------|-----------------------|---------|
| POST   | /api/auth/register    | Public  |
| POST   | /api/auth/login       | Public  |
| GET    | /api/auth/me          | Private |
| PUT    | /api/auth/profile     | Private |
| PUT    | /api/auth/change-password | Private |

### Properties
| Method | Endpoint                      | Access        |
|--------|-------------------------------|---------------|
| GET    | /api/properties               | Public        |
| GET    | /api/properties/:id           | Public        |
| GET    | /api/properties/owner/mine    | Owner         |
| POST   | /api/properties               | Owner         |
| PUT    | /api/properties/:id           | Owner         |
| DELETE | /api/properties/:id           | Owner         |

### Bookings
| Method | Endpoint                  | Access  |
|--------|---------------------------|---------|
| POST   | /api/bookings             | Student |
| GET    | /api/bookings/my          | Student |
| GET    | /api/bookings/owner       | Owner   |
| PUT    | /api/bookings/:id/cancel  | Student |

### Admin
| Method | Endpoint                          | Access |
|--------|-----------------------------------|--------|
| GET    | /api/admin/dashboard              | Admin  |
| GET    | /api/admin/users                  | Admin  |
| PUT    | /api/admin/users/:id/toggle       | Admin  |
| GET    | /api/admin/properties             | Admin  |
| PUT    | /api/admin/properties/:id/review  | Admin  |
| GET    | /api/admin/bookings               | Admin  |
| GET    | /api/admin/complaints             | Admin  |

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
