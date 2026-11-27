import {
  getAllUsers,
  setUserSuspension,
  removeUser,
} from "./users.service.js";

/**
 * GET /api/admin/users
 * Search and list registered accounts.
 */
export const listUsers = async (req, res, next) => {
  try {
    const { search, status, role, page, limit } = req.query;
    const result = await getAllUsers({ search, status, role, page, limit });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:userId/status
 * Suspend or unsuspend a user account.
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isSuspended } = req.body || {};

    const user = await setUserSuspension({
      userId,
      isSuspended,
      currentAdminId: req.user._id,
    });

    res.status(200).json({
      message: isSuspended
        ? "User suspended successfully."
        : "User unsuspended successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:userId
 * Permanently delete a user account.
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    await removeUser({
      userId,
      currentAdminId: req.user._id,
    });

    res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
