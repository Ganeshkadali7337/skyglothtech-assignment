const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  let jwtToken;
  const authHeader = req.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    res.status(401);
    res.send("please provide JWT token");
  } else {
    jwt.verify(jwtToken, "ganesh", async (error, payload) => {
      if (error) {
        res.status(401);
        res.send("Invalid JWT Token");
      } else {
        req.userId = payload.id;
        next();
      }
    });
  }
};

module.exports = authenticate;
