import asyncHandler from "express-async-handler";
import DatabaseHandler from "../lib/database/DatabaseHandler.js";
import {
  getUserByEmailAsync,
  insertUserAsync,
} from "../services/userService.js";
import {
  comparePassword,
  generateJWT,
  generatePassword,
} from "../utils/index.js";
import {
  getChannel,
  publishMessage,
  subscribeMessage,
} from "../lib/rabbitmq/index.js";
import { NOTIFICATION_SERVICE_BINDING_KEY } from "../config/index.js";
import { unicastNotificationAsync } from "../services/notificationService.js";

// @desc Auth user/ set token
// route POST /api/users/auth
// @access Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // get user for email
  const results = await getUserByEmailAsync(email);

  if (results.length == 0) {
    // no user exists
    res.status(401);
    throw new Error("Invalid credentials");
  } else {
    // get user info
    const user = results[0];
    // match passwords
    const matched = await comparePassword(password, user.PasswordHash);

    if (!matched) {
      // incorrect passwords
      res.status(401);
      throw new Error("Invalid credent");
    } else {
      // login success
      // create JWT and pass through cookie
      generateJWT(res, {
        userId: user.Id,
        email: user.Email,
        roleId: "1",
        roleName: "systemAdministrator",
      });

      await unicastNotificationAsync(
        `Sign in Successful`,
        `Your have logged in to your account ${user.Email} `,
        user.Id
      );

      return res.status(200).json({
        success: true,
        userInfo: {
          userId: user.Id,
          email: user.Email,
          roleId: "1",
          roleName: "systemAdministrator",
        },
      });
    }
  }
});

// @desc Auth registration
// route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { email, username, name, phoneNumber, password } = req.body;

  const results = await getUserByEmailAsync(email);

  if (results.length > 0) {
    res.status(400);
    throw new Error("Email Already Exists");
  } else {
    const hashedPassword = await generatePassword(password);
    const results = await insertUserAsync({
      email,
      username,
      name,
      phoneNumber,
      hashedPassword,
    });
    return res.status(201).json({
      success: true,
      userCreated: results,
    });
  }
});

// @desc Auth user logout
// route POST /api/users/logout
// @access Public
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  return res.status(200).json("User logged out");
});

// @desc Get user profile
// route GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const results = await DatabaseHandler.executeSingleQueryAsync(
    'select * from "User"',
    []
  );
  return res.status(200).json(results);
});

// @desc update user profile
// route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  console.log(req.userInfo);
  return res.status(200).json("user profile updated");
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
