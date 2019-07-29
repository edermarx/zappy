const express = require('express');

const db = require('../providers/firebase');

const app = express();
const User = db.ref(`${process.env.FIREBASE_ACCESS_TOKEN}/users`);

// ==================== REGISTER ==================== // 

app.post('/register', (req, res) => {
  
});

// ==================== LOGIN ==================== // 

module.exports = app;