import jwt from "jsonwebtoken";



export function authUser(req, res, next) {
  // Look in cookies OR Authorization header
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Now req.user has the ID for the controller
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", success: false });
  }
}