// ==================== EXTERNAL IMPORTS ==================== //

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');

// ==================== INTERNAL IMPORTS ==================== //

const handleError = require('./providers/handle-error');

// ==================== GLOBAL VARIABLES ==================== //

const app = express();

// ==================== MIDDLEWARE ==================== //

app.use('/views', express.static('views'));
app.use('/uploads', express.static('uploads'));

dotenv.config();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const sess = {
  secret: process.env.SESSION_TOKEN,
  resave: false,
  saveUninitialized: true,
  cookie: {},
};

app.use(session(sess));

// ==================== FUNCTIONS ==================== //

const getViewPath = view => path.join(__dirname, `./views/${view}/${view}.html`);

// ==================== USER ROUTE ==================== //

app.use('/api/user', require('./routes/user'));

// ==================== VIEWS ==================== //

app.get('/:view', (req, res) => {
  res.sendFile(getViewPath(req.params.view), (err) => {
    if (err) res.send('404');
  });
});

// ==================== ACCESS CONTROL ==================== //

app.use((req, res, next) => {
  if (!req.session.userID) {
    if (req.url.indexOf('api') !== -1) {
      handleError(res, null, 'unauthenticated');
      return;
    }
    res.redirect('/login');
    return;
  }
  next();
});

// ==================== AUTH REQUIRED ==================== //

app.get('/', (req, res) => {
  res.sendFile(getViewPath('home'));
});

app.use('/api/message', require('./routes/message'));

// ==================== RUN SERVER ==================== //

app.listen(3000, () => {
  console.log('READY');
});
