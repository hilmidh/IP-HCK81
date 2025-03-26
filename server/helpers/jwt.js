const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.SECRET_KEY;

const signJWT = (data) => {
  return jwt.sign(data, JWT_SECRET);
};

const verify = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  signJWT,
  verify,
};