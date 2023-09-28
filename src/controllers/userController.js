import asyncHandler from "express-async-handler";
import {
  getUserByEmailAsync,
  insertUserAsync,
  updateUserAsync,
  getRolesAsync,
  createRoleAsync,
  deleteRoleAsync,
  updateRoleAsync,
  assignUserToRoleAsync,
  getUsersInRoleAsync,
  getRolesOfUserAsync,
  registerOrphanageAsync
} from "../services/userService.js";
import {
  comparePassword,
  generateJWT,
  generatePassword,
} from "../utils/index.js";
import { unicastNotificationAsync } from "../services/notificationService.js";

// @desc Auth user/ set token
// route POST /api/users/auth
// @access Public
export const authUser = asyncHandler(async (req, res) => {
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

      const results = await getRolesOfUserAsync(user.Id);
      const role = results[0];

      if (!role) return res.status(401).json("no roles found for user");

      generateJWT(res, {
        userId: user.Id,
        email: user.Email,
        roleId: "1",
        roleName: role.Name,
      });

      await unicastNotificationAsync(
        `Sign in Successful`,
        `Your have logged in to your account ${user.Email}`,
        user.Id
      );

      return res.status(200).json({
        success: true,
        userInfo: {
          userId: user.Id,
          email: user.Email,
          roleId: role.Id,
          roleName: role.Name,
        },
      });
    }
  }
});

// @desc Auth registration
// route POST /api/users/register
// @access Public
export const registerUser = asyncHandler(async (req, res) => {
  const {
    email,
    username,
    name,
    phoneNumber,
    password,
    orphanageId,
    address,
    nic,
    gender,
    dob,
  } = req.body;

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
      orphanageId,
      address,
      nic,
      gender,
      dob,
    });
    return res.status(201).json({
      success: true,
      userCreated: results[0],
    });
  }
});

// @desc Auth user logout
// route POST /api/users/logout
// @access Public
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  return res.status(200).json("User logged out");
});

// @desc Get user profile
// route GET /api/users/profile
// @access Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const results = await getUserByIdAsync(req.query.id);
  if (!results[0]) return res.status(404).json("user not found");
  delete results[0].PasswordHash;
  return res.status(200).json(results[0]);
});

// @desc update user profile
// route PUT /api/users/profile
// @access Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const results = await updateUserAsync(req.body);
  if (!results[0]) return res.status(404).json("user not found");
  delete results[0].PasswordHash;
  return res.status(200).json(results[0]);
});

// @desc get user roles
// route GET /api/users/role
// @access Private
export const getRoles = asyncHandler(async (req, res) => {
  return res.status(200).json(await getRolesAsync());
});

// @desc create user role
// route POST /api/users/role
// @access Private
export const createRole = asyncHandler(async (req, res) => {
  return res.status(200).json(await createRoleAsync(req.body));
});

// @desc delete user role
// route DELETE /api/users/role
// @access Private
export const deleteRole = asyncHandler(async (req, res) => {
  return res.status(200).json(await deleteRoleAsync(req.body));
});

// @desc update user role
// route PUT /api/users/role
// @access Private
export const updateRole = asyncHandler(async (req, res) => {
  const results = await updateRoleAsync(req.body);
  if (results[0]) return res.status(200).json(results[0]);
  return res.status(404).json("id not found");
});

// @desc assign user to role
// route PUT /api/users/assignUserToRole
// @access Private
export const assignUserToRole = asyncHandler(async (req, res) => {
  const results = await assignUserToRoleAsync(req.body);
  return res.status(200).json(results[0]);
});

// @desc get users for role
// route PUT /api/users/assignUserToRole
// @access Private
export const getUsersInRole = asyncHandler(async (req, res) => {
  const results = await getUsersInRoleAsync(req.query.roleId);
  results.map((result) => delete result.PasswordHash);
  return res.status(200).json(results);
});

// @desc get users for role
// route PUT /api/users/assignUserToRole
// @access Private
export const getRolesOfUser = asyncHandler(async (req, res) => {
  const results = await getRolesOfUserAsync(req.query.userId);
  if (results[0]) return res.status(200).json(results[0]);
  return res.status(404).json("no roles for user");
});

// @desc register orphanage
// route POST /api/users/registerOrphanage
// @access Public
export const registerOrphanage = asyncHandler(async (req, res) => {
  const results = await registerOrphanageAsync(req.body);
  return res.status(200).json(results);
});
