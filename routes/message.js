const express = require('express');
const db = require('../providers/firebase');

const Message = db.ref(`${process.env.FIREBASE_ACCESS_TOKEN}/messages`);

const app = express();

// get messages from this chat
app.get('/:chatID', async (req, res) => {
  const messagesFirebase = await Message.child(req.params.chatID).once('value');
  const messages = [];
  messagesFirebase.forEach((message) => {
    messages.push(message.val());
  });
  res.send(messages);
});

// add message to this chat
app.post('/:chatID', async (req, res) => {
  await Message.child(req.params.chatID).push({
    sender: req.session.userID,
    content: req.body.content,
    timestamp: new Date().getTime(),
  });
  res.send('ok');
});

module.exports = app;