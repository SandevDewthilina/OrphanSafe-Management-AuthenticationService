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
  getRolesOfUser,
  registerOrphanage,
  verifyEmail,
  verifyEmailByCode
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/s3UploadMiddleware.js";

const router = express.Router();

router.post("/auth", authUser);
router.post("/register", registerUser);
router.get("/verifyEmail", verifyEmail)
router.get("/verifyEmailByCode", verifyEmailByCode)
router.post(
  "/registerOrphanage",
  upload.fields([
    {name: 'regCert'},
    {name: 'housePlan'},
    {name: 'landReport'}
  ]),
  registerOrphanage
);
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
router.route("/getUsersInRole").get(protect, getUsersInRole);
router.route("/getRolesOfUser").get(protect, getRolesOfUser);

export default router;
