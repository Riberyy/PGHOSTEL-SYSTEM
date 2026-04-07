const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });

// Routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/bookings',   require('./routes/bookingRoutes'));
app.use('/api/rooms',      require('./routes/roomRoutes'));
app.use('/api/payments',   require('./routes/paymentRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/admin',      require('./routes/adminRoutes'));
app.use('/api/wishlist',   require('./routes/wishlistRoutes'));

// Health check
app.get('/', (req, res) => res.json({ message: 'PG & Hostel Management API running 🏠' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Cron: Send rent reminders on 1st of every month
cron.schedule('0 9 1 * *', async () => {
  const { sendRentReminders } = require('./utils/rentReminder');
  await sendRentReminders();
  console.log('📧 Rent reminders sent');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
