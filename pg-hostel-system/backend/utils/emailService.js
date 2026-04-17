// backend/utils/emailService.js
const nodemailer = require('nodemailer');

// sendEmail is properly defined as a function
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`📧 Email skipped (no credentials) - would send to ${to}`);
      return true;
    }
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"PG & Hostel System 🏠" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
    console.log(`📧 Email sent to ${to}`);
    return true;
  } catch (err) {
    console.error('Email error:', err.message);
    return false;
  }
};

// Booking confirmation email
const sendBookingConfirmation = async (student, property, booking) => {
  return sendEmail({
    to: student.email,
    subject: `✅ Booking Confirmed – ${property.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:30px;border-radius:10px;text-align:center;color:white;">
          <h1 style="margin:0;font-size:28px;">🏠 Booking Confirmed!</h1>
          <p style="margin:10px 0 0;opacity:0.9;">Smart PG & Hostel Management System</p>
        </div>
        <div style="background:white;padding:30px;border-radius:10px;margin-top:15px;">
          <p style="font-size:18px;">Dear <strong>${student.name}</strong>,</p>
          <p style="color:#475569;">You have successfully joined this PG/Hostel. Here are your booking details:</p>
          <div style="background:#f1f5f9;padding:20px;border-radius:8px;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#64748b;">Property</td><td style="padding:8px 0;font-weight:600;">${property.name}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Room Number</td><td style="padding:8px 0;font-weight:600;">Room ${booking.roomNumber}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Room Type</td><td style="padding:8px 0;font-weight:600;">${booking.roomType}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Check-in Date</td><td style="padding:8px 0;font-weight:600;">${new Date(booking.checkIn).toLocaleDateString('en-IN')}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Monthly Rent</td><td style="padding:8px 0;font-weight:600;color:#4f46e5;">₹${booking.rentAmount?.toLocaleString()}</td></tr>
              ${booking.roommate ? `<tr><td style="padding:8px 0;color:#64748b;">Roommate Match</td><td style="padding:8px 0;font-weight:600;color:#10b981;">${booking.matchScore}% compatible</td></tr>` : ''}
            </table>
          </div>
          <p style="color:#475569;">Please ensure rent is paid on time each month.</p>
          <div style="text-align:center;margin-top:25px;">
            <a href="http://localhost:3000/student/bookings" style="background:#4f46e5;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:600;">View Booking</a>
          </div>
        </div>
        <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:15px;">Smart PG & Hostel Management System</p>
      </div>
    `,
  });
};

// Payment confirmation email
const sendPaymentConfirmation = async (student, payment, property) => {
  return sendEmail({
    to: student.email,
    subject: `💰 Payment Confirmed – ${property?.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#10b981,#06b6d4);padding:30px;border-radius:10px;text-align:center;color:white;">
          <h1 style="margin:0;font-size:28px;">✅ Payment Successful!</h1>
          <p style="margin:10px 0 0;opacity:0.9;">Your rent has been paid successfully</p>
        </div>
        <div style="background:white;padding:30px;border-radius:10px;margin-top:15px;">
          <p style="font-size:18px;">Dear <strong>${student.name}</strong>,</p>
          <p style="color:#475569;">Payment for this month has been completed successfully.</p>
          <div style="background:#f0fdf4;border:1px solid #86efac;padding:20px;border-radius:8px;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#64748b;">Property</td><td style="padding:8px 0;font-weight:600;">${property?.name}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Amount Paid</td><td style="padding:8px 0;font-weight:600;color:#10b981;">₹${payment.amount?.toLocaleString()}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Month</td><td style="padding:8px 0;font-weight:600;">${payment.month}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Transaction ID</td><td style="padding:8px 0;font-weight:600;">${payment.transactionId || 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Paid On</td><td style="padding:8px 0;font-weight:600;">${new Date().toLocaleDateString('en-IN')}</td></tr>
            </table>
          </div>
          <p style="color:#475569;">Your next payment will be due on the 1st of next month. Thank you!</p>
        </div>
        <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:15px;">Smart PG & Hostel Management System</p>
      </div>
    `,
  });
};

// Rent reminder email
const sendRentReminder = async (student, payment, property) => {
  return sendEmail({
    to: student.email,
    subject: `⚠️ Rent Reminder – ${property?.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:30px;border-radius:10px;text-align:center;color:white;">
          <h1 style="margin:0;font-size:28px;">⚠️ Rent Due Reminder</h1>
          <p style="margin:10px 0 0;opacity:0.9;">Your rent payment is pending</p>
        </div>
        <div style="background:white;padding:30px;border-radius:10px;margin-top:15px;">
          <p style="font-size:18px;">Dear <strong>${student.name}</strong>,</p>
          <p style="color:#475569;">This is a reminder that your rent payment is pending:</p>
          <div style="background:#fef3c7;border:1px solid #fcd34d;padding:20px;border-radius:8px;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#64748b;">Property</td><td style="padding:8px 0;font-weight:600;">${property?.name}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Amount Due</td><td style="padding:8px 0;font-weight:600;color:#ef4444;">₹${payment.amount?.toLocaleString()}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Due Date</td><td style="padding:8px 0;font-weight:600;">${new Date(payment.dueDate).toLocaleDateString('en-IN')}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Status</td><td style="padding:8px 0;font-weight:600;color:#ef4444;">${payment.status?.toUpperCase()}</td></tr>
            </table>
          </div>
          <p style="color:#ef4444;font-weight:600;">⚠️ Please pay immediately to avoid any penalties.</p>
          <div style="text-align:center;margin-top:25px;">
            <a href="http://localhost:3000/student/payments" style="background:#ef4444;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:600;">Pay Now</a>
          </div>
        </div>
      </div>
    `,
  });
};

// Manual warning email (owner/admin)
const sendManualWarning = async (studentEmail, studentName, propertyName, message) => {
  return sendEmail({
    to: studentEmail,
    subject: `🚨 Important Notice – ${propertyName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:30px;border-radius:10px;text-align:center;color:white;">
          <h1 style="margin:0;font-size:28px;">🚨 Important Notice</h1>
          <p style="margin:10px 0 0;opacity:0.9;">${propertyName}</p>
        </div>
        <div style="background:white;padding:30px;border-radius:10px;margin-top:15px;">
          <p style="font-size:18px;">Dear <strong>${studentName}</strong>,</p>
          <div style="background:#fee2e2;border:1px solid #fecaca;padding:20px;border-radius:8px;margin:20px 0;">
            <p style="color:#991b1b;margin:0;font-size:16px;">${message || 'Half month has passed and your fees are still pending. Strict action may be taken.'}</p>
          </div>
          <p style="color:#475569;">Please take immediate action to avoid any consequences.</p>
          <div style="text-align:center;margin-top:25px;">
            <a href="http://localhost:3000/student/payments" style="background:#ef4444;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:600;">Pay Now</a>
          </div>
        </div>
      </div>
    `,
  });
};

module.exports = { sendBookingConfirmation, sendPaymentConfirmation, sendRentReminder, sendManualWarning };