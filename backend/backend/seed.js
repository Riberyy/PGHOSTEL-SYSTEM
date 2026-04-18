const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.deleteMany({ email: { $in: ['admin@pg.com','owner@pg.com','student@pg.com'] } });
  await User.create([
    { name:'Admin User',    email:'admin@pg.com',   password:'admin123',   phone:'9000000001', role:'admin' },
    { name:'Owner Raj',     email:'owner@pg.com',   password:'owner123',   phone:'9000000002', role:'owner' },
    { name:'Student Priya', email:'student@pg.com', password:'student123', phone:'9000000003', role:'student',
      preferences:{ sleepSchedule:'early_bird', foodPreference:'vegetarian', lifestyle:'studious', gender:'female' } },
  ]);
  console.log('✅ Demo users created!');
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });