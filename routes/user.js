const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('usuario');
});

module.exports = app;