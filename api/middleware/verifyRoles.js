
const ROLES_LIST = require("../config/roles_list.js");

module.exports = (req, res, next) => {
  const { roles } = req.user;
  if (roles && roles.includes(ROLES_LIST.Admin)) {
    next();
  } else {
    return res.status(403).json({ message: "Unauthorized" });
  }
};
