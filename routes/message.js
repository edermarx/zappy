const express = require('express');
const db = require('../providers/firebase');
const atob = require('atob');

const handleError = require('../providers/handle-error');

const Message = db.ref(`${process.env.FIREBASE_ACCESS_TOKEN}/messages`);

const app = express();

// get messages from this chat
app.get('/:chatID', async (req, res) => {
  // check if user can access message
  const decryptedChatID = atob(req.params.chatID);
  const allowedUsers = decryptedChatID.split('(*-*)');

  if(allowedUsers.indexOf(req.session.userID) === -1){
    handleError(res, null, 'not-allowed');
    return;
  }

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