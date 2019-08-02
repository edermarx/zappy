const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

const db = require('../providers/firebase');
const handleError = require('../providers/handle-error');

const app = express();
const User = db.ref(`${process.env.FIREBASE_ACCESS_TOKEN}/users`);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/image-profiles'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

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

app.post('/login', async (req, res) => {
  try {
    // check if there's missing data
    if (!req.body.username || !req.body.password) {
      handleError(res, null, 'missing-data');
      return;
    }

    // check if user exists
    const user = (await User
      .orderByChild('username')
      .equalTo(req.body.username)
      .once('value')).val();

    if (!user) {
      handleError(res, null, 'user-not-found');
      return;
    }

    const [userID, userData] = Object.entries(user)[0];

    const match = await bcrypt.compare(req.body.password, userData.password);

    if (match) { // senha tá correta
      req.session.userID = userID;
      res.send(userID);
      return;
    }
    handleError(res, null, 'wrong-password');
  } catch (err) {
    handleError(res, err, null);
  }
});

// ==================== CONTACT ==================== //

// add contact
app.post('/contact/:contact', async (req, res) => {
  try {
    const user = (await User
      .orderByChild('username')
      .equalTo(req.params.contact)
      .once('value')).val();

    if (!user) {
      handleError(res, null, 'user-not-found');
      return;
    }

    const [contactID, contactData] = Object.entries(user)[0];

    await User.child(req.session.userID).child('contacts').push({
      alias: contactData.alias,
      id: contactID,
    });

    res.send('ok');
  } catch (err) {
    handleError(res, err, null);
  }
});

app.get('/contact', async (req, res) => {
  try {
    if (!req.session.userID) {
      handleError(res, null, 'unauthenticated');
      return;
    }

    const contactsFirebase = await User.child(req.session.userID).child('contacts').once('value');
    const contacts = [];
    contactsFirebase.forEach((contact) => {
      contacts.push(contact.val());
    });

    if (req.query.tamanho) {
      res.send(`${contacts.length}`);
      return;
    }

    res.send(contacts);
  } catch (err) {
    handleError(res, err, null);
  }
});

// ==================== HAS-MESSAGE ==================== //


app.get('/has-message', async (req, res) => {
  try {
    const hasMessageFirebase = await User.child(req.session.userID).child('hasMessage').once('value');
    const hasMessage = [];
    hasMessageFirebase.forEach((chatID) => {
      hasMessage.push(chatID);
    });
    res.send(hasMessage);
  } catch (err) {
    handleError(res, err, null);
  }
});

app.delete('/has-message/:chatID', async (req, res) => {
  try {
    const user = (await User
      .child(req.session.userID)
      .child('hasMessage')
      .orderByChild('chatID')
      .equalTo(req.params.chatID)
      .once('value')).val();

    const key = Object.entries(user)[0][0];

    await User.child(req.session.userID).child('hasMessage').child(key).remove();

    res.send('ok');
  } catch (err) {
    console.log(err);
    handleError(res, err, null);
  }
});

// ==================== PROFILE ==================== //

app.get('/profile', async (req, res) => {
  try {
    const user = (await User.child(req.session.userID).once('value')).val();
    res.send(user);
  } catch (err) {
    handleError(res, err, null);
  }
});

app.patch('/profile', async (req, res) => {
  try {
    await User.child(req.session.userID).update({ alias: req.body.alias });
    res.send('ok');
  } catch (err) {
    handleError(res, err, null);
  }
});

app.post('/profile/image', upload.single('profile-image'), (req, res) => {
  res.send('ok');
});

module.exports = app;
