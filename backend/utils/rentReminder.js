const nodemailer = require('nodemailer');
const { Payment } = require('../models/PaymentComplaint');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendRentReminders = async () => {
  try {
    const now = new Date();
    const upcoming = new Date(now);
    upcoming.setDate(now.getDate() + 5);

    const pendingPayments = await Payment.find({
      status: { $in: ['pending', 'overdue'] },
      dueDate: { $lte: upcoming },
    })
      .populate('student', 'name email')
      .populate('property', 'name');

    // Mark overdue
    for (const p of pendingPayments) {
      if (p.dueDate < now && p.status === 'pending') {
        p.status = 'overdue';
        await p.save();
      }

      if (!p.student?.email) continue;

      await transporter.sendMail({
        from: `"PG & Hostel System" <${process.env.EMAIL_USER}>`,
        to: p.student.email,
        subject: `Rent Reminder – ${p.property?.name || 'Your PG'}`,
        html: `
          <h2>Rent Reminder</h2>
          <p>Dear ${p.student.name},</p>
          <p>Your rent of <strong>₹${p.amount}</strong> for <strong>${p.property?.name}</strong> 
          is due on <strong>${new Date(p.dueDate).toDateString()}</strong>.</p>
          <p>Please log in to your account to make the payment.</p>
          <br/>
          <p>– Smart PG & Hostel Management System</p>
        `,
      });
    }

    console.log(`Sent ${pendingPayments.length} rent reminders`);
  } catch (err) {
    console.error('Rent reminder error:', err.message);
  }
};

module.exports = { sendRentReminders };
