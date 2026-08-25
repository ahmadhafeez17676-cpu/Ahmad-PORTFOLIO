require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Contact = require('../models/Contact');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

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

// POST /api/contact — Save contact form submission
app.post('/api/contact', async (req, res) => {
    if (!dbConnected) {
        return res.status(503).json({
            success: false,
            message: '⚠️ Database not connected. Please start MongoDB service and restart the server.'
        });
    }
    try {
        const { name, email, projectType, budget, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
        }
        const contact = new Contact({ name, email, projectType, budget, message });
        await contact.save();
        console.log(`📨  New message from: ${name} <${email}>`);
        res.status(201).json({ success: true, message: 'Message received! I will get back to you soon. 🚀' });
    } catch (err) {
        console.error('Contact save error:', err);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
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
