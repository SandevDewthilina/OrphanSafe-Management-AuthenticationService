import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, NODE_ENV } from "../config/index.js";

const generatePassword = async (originalPassword) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(originalPassword, salt);
};

const comparePassword = async (originalPassword, hashPassword) => {
  return await bcrypt.compare(originalPassword, hashPassword);
};

const generateJWT = (res, { userId, email, roleId, roleName }) => {
  const token = jwt.sign(
    {
      userId: userId,
      email: email,
      roleId: roleId,
      roleName: roleName,
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 1 * 60 * 60 * 1000,
  });
};

const verifyJWT = (token) => {
  return jwt.verify(token, JWT_SECRET)
};

export { generatePassword, comparePassword, generateJWT, verifyJWT };
