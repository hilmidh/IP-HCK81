const { User } = require("../models");
const { verify } = require("../helpers/jwt.js");

const authentication = async (req, res, next) => {
  const bearerToken = req.headers.authorization;
  if (!bearerToken) {
    throw { name: "Unauthorized", message: "Invalid token" };
    return;
  }

  const [, token] = bearerToken.split(" ");
  if (!token) {
    throw { name: "Unauthorized", message: "Invalid token" };
    return;
  }

  try {
    const data = verify(token);
    // res.json(data)

    const user = await User.findByPk(data.id);
    if (!user) {
      throw { name: "Unauthorized", message: "Invalid token" };
      return;
    }
    // res.json(user)
    req.user = user;
    next();
  } catch (error) {
    // res.json(error)
    throw error
  }
};

module.exports = {
  authentication,
};
