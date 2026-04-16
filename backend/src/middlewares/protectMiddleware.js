import { verify } from "../utils/token.js";

export const protect =
  (roles = []) =>
  (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res
          .status(401)
          .json({ message: "Missing authorization header" });
      }

      if (!authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({
            message:
              "Invalid authorization header format. Expected Bearer token",
          });
      }

      const token = authHeader.substring("Bearer ".length).trim();
      if (!token) {
        return res.status(401).json({ message: "Token is empty" });
      }

      const decoded = verify(token);
      if (!decoded || !decoded.id) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      req.user = decoded;

      if (roles.length && !roles.includes(req.user.role)) {
        return res
          .status(403)
          .json({
            message: `Forbidden. User role '${req.user.role}' not in allowed roles: ${roles.join(", ")}`,
          });
      }

      next();
    } catch (error) {
      const message =
        error.message === "jwt expired"
          ? "Token has expired"
          : error.message === "invalid signature"
            ? "Invalid token signature"
            : error.message === "invalid token"
              ? "Invalid token"
              : `Token verification failed: ${error.message}`;
      return res.status(401).json({ message });
    }
  };
