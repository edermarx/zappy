module.exports = (res, err, type) => {
  res.status(400).send(type);
};
