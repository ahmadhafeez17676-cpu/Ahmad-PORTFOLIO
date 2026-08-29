require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---- Email Transporter (Gmail) ----
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ---- Start server FIRST (don't wait for MongoDB) ----
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`\n🚀  Portfolio server running at: http://localhost:${PORT}`);
        console.log(`📋  View messages at:             http://localhost:${PORT}/api/messages\n`);
    });
}
module.exports = app;

// ---- MongoDB Connection (non-blocking) ----
let dbConnected = false;

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        dbConnected = true;
        console.log('✅  MongoDB connected — portfolio_db');
    })
    .catch(err => {
        console.warn('\n⚠️   MongoDB not available. Contact form will show a message.');
        console.warn('    Make sure MongoDB is running: net start MongoDB\n');
    });

// ---- API Routes ----

// POST /api/contact — Save + Email notification
app.post('/api/contact', async (req, res) => {
    const { name, email, projectType, budget, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    // 1. Save to MongoDB (if connected)
    if (dbConnected) {
        try {
            const contact = new Contact({ name, email, projectType, budget, message });
            await contact.save();
            console.log(`📨  Saved to DB: ${name} <${email}>`);
        } catch (err) {
            console.error('Contact save error:', err);
        }
    }

    // 2. Send Email Notification
    try {
        const mailOptions = {
            from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.NOTIFY_EMAIL,
            subject: `📩 New Message from ${name} — Portfolio Contact`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1626; color: #e2e8f0; border-radius: 12px; padding: 32px; border: 1px solid #00d4ff33;">
                    <h2 style="color: #00d4ff; margin-bottom: 24px;">📬 New Portfolio Contact</h2>
                    <table style="width:100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #94a3b8; width: 130px;">Name:</td>       <td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
                        <tr><td style="padding: 8px 0; color: #94a3b8;">Email:</td>      <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #00d4ff;">${email}</a></td></tr>
                        <tr><td style="padding: 8px 0; color: #94a3b8;">Project Type:</td><td style="padding: 8px 0;">${projectType || 'Not specified'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #94a3b8;">Budget:</td>     <td style="padding: 8px 0;">${budget || 'Not specified'}</td></tr>
                    </table>
                    <hr style="border-color: #00d4ff22; margin: 20px 0;">
                    <p style="color: #94a3b8; margin-bottom: 8px;">Message:</p>
                    <div style="background: #0a1628; padding: 16px; border-radius: 8px; border-left: 3px solid #00d4ff; line-height: 1.6;">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <p style="color: #334155; font-size: 12px; margin-top: 24px;">Sent from your Ahmad Hafeez Portfolio — ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✉️   Email sent to ${process.env.NOTIFY_EMAIL}`);
    } catch (emailErr) {
        console.error('Email send error:', emailErr.message);
        // Still respond success — data was saved to DB
    }

    res.status(201).json({ success: true, message: 'Message received! I will get back to you soon. 🚀' });
});

// GET /api/messages — View all contact submissions
app.get('/api/messages', async (req, res) => {
    if (!dbConnected) return res.json({ success: false, message: 'MongoDB not connected.' });
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.json({ success: true, count: messages.length, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ---- Serve Frontend (catch-all) ----
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});
