import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generatePassword = async (originalPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(originalPassword, salt);
};

const comparePassword = async (originalPassword, hashPassword) => {
  return await bcrypt.compare(originalPassword, hashPassword);
};

export { generatePassword };
