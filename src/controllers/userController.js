import asyncHandler from "express-async-handler";
import DatabaseHandler from "../lib/database/DatabaseHandler.js";

// @desc Auth user/ set token
// route POST /api/users/auth
// @access Public
const authUser = asyncHandler(async (req, res) => {
  return res.status(200).json("user authenticated");
});

// @desc Auth registration
// route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  return res.status(200).json("user registered");
});

// @desc Auth user logout
// route POST /api/users/logout
// @access Public
const logoutUser = asyncHandler(async (req, res) => {
  return res.status(200).json("user logout");
});

// @desc Get user profile
// route GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const results = await DatabaseHandler.executeSingleQuery(
    'select * from "User"',
    []
  );
  return res.status(200).json(results);
});

// @desc update user profile
// route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  return res.status(200).json("user profile updated");
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
