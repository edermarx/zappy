const firebase = require('firebase');

firebase.initializeApp({
  apiKey: process.env.FIREBASE_KEY,
  authDomain: "zappy-3d9a8.firebaseapp.com",
  databaseURL: "https://zappy-3d9a8.firebaseio.com",
  projectId: "zappy-3d9a8",
  storageBucket: "",
  messagingSenderId: "144865117965",
  appId: "1:144865117965:web:886c4c7c33faec12"
});

module.exports = firebase.database();