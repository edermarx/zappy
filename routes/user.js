const express = require('express');
const bcrypt = require('bcrypt');

const db = require('../providers/firebase');
const handleError = require('../providers/handle-error');

const app = express();
const User = db.ref(`${process.env.FIREBASE_ACCESS_TOKEN}/users`);

// ==================== REGISTER ==================== // 

app.post('/register', async (req, res) => {
  try {
    // check if there's missing data
    if (
      !req.body.username
      || !req.body.password
      || !req.body.password2
      || !req.body.alias
    ) {
      handleError(res, null, 'missing-data');
      return;
    }

    // check if user already exists
    const checkUser = (await User
      .orderByChild('username')
      .equalTo(req.body.username)
      .once('value')).val();

    if (checkUser) {
      handleError(res, null, 'user-already-exists');
      return;
    }

    if (req.body.password !== req.body.password2) {
      handleError(res, null, 'passwords-dont-match');
      return;
    }

    const hash = await bcrypt.hash(req.body.password, 10);

    await User.push({
      username: req.body.username,
      password: hash,
      alias: req.body.alias,
    });

    res.send('ok');
  } catch (err) {
    handleError(res, err, null);
  }
});

// ==================== LOGIN ==================== // 

module.exports = app;