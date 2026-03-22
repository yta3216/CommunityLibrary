// bring in the jwt library so we can create and check login tokens
const jwt = require("jsonwebtoken");

// helper function to safely read jwt secret from environment variables
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not defined");
  }
  return secret;
};

// create a signed token for a user after login/register
const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      username: user.username,
    },
    getJwtSecret(),
    { expiresIn: "7d" },
  );
};

// middleware that blocks routes unless request has a valid bearer token
const authRequired = (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "authorization token is required" });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  // verify token and attach payload to req.user so later handlers know who is logged in
  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "invalid or expired token" });
  }
};

// middleware  that checks if logged in user has a required role
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "authorization token is required" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: "forbidden" });
    }

    return next();
  };
};

// export helpers/middleware so other files can import and use them
module.exports = {
  authRequired,
  requireRole,
  signToken,
};
