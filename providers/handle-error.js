module.exports = (res, err, type) => {
  // TODO: LOG
  res.status(400).send(type);
};
