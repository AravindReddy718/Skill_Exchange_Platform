
const roleMiddleware = (...allowedRoles) => {
  if (
    allowedRoles.length === 0 ||
    allowedRoles.some((role) => !["member", "admin"].includes(role))
  ) {
    throw new Error("Invalid role middleware configuration.");
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden. You don't have permission to access this resource.",
      });
    }

    next();
  };
};

export default roleMiddleware;
