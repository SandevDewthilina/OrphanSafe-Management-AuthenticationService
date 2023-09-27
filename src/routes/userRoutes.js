import express from "express";
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getRoles,
  createRole,
  deleteRole,
  updateRole,
  assignUserToRole,
  getUsersInRole,
  getRolesOfUser
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/auth", authUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router
  .route("/roles")
  .get(protect, getRoles)
  .post(protect, createRole)
  .put(protect, updateRole)
  .delete(protect, deleteRole);

router.route("/userRole").post(protect, assignUserToRole);
router.route('/getUsersInRole').get(protect, getUsersInRole);
router.route('/getRolesOfUser').get(protect, getRolesOfUser);

export default router;
