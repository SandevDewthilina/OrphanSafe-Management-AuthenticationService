import DatabaseHandler from "../lib/database/DatabaseHandler.js";

export const getUserByEmailAsync = async (email) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    'SELECT * FROM "User" WHERE "Email" = $1 LIMIT 1',
    [email]
  );
};

export const insertUserAsync = async ({
  email,
  username,
  name,
  phoneNumber,
  hashedPassword,
}) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `INSERT INTO "User" ("Username", "Name", "Email","PhoneNumber","PasswordHash") 
    values($1,$2,$3,$4,$5) RETURNING "Username", "Name", "Email", "PhoneNumber"`,
    [username, name, email, phoneNumber, hashedPassword]
  );
};
