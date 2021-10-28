const jwt = require("jsonwebtoken");
const User = require("../models/user");

//accepting authentication
const auth = async (req, res, next) => {
  try {
    //looking for the header that the user is supost to provide
    //const token = req.header("Authorization").replace("Bearer ", "");

    const token = req.cookies["auth_token"];
    //validating header
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //finding associted user
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

module.exports = auth;
