module.exports = (res, err, type) => {
  // TODO: LOG
  const errorCodes = {
    unauthenticated: 401,
    'not-allowed': 403,
    'empty-message': 400,
    'wrong-password': 401,
  };
  res.status(errorCodes[type] || 400).send(type);
};
