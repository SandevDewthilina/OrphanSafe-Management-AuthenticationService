import DatabaseHandler from "../lib/database/DatabaseHandler.js";
import { generatePassword } from "../utils/index.js";

export const getUserByEmailAsync = async (email) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    'SELECT * FROM "User" WHERE "Email" = $1 LIMIT 1',
    [email]
  );
};

export const getOrphanageByRegistrationIdAsync = async (regId) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    'SELECT * FROM "Orphanage" WHERE "RegistrationId" = $1 LIMIT 1',
    [regId]
  );
}

export const insertUserAsync = async ({
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
}) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `INSERT INTO "User" 
    ("Username", "Name", "Email","PhoneNumber","PasswordHash", "OrphanageId", "Address", "NIC", "Gender", "DOB" ) 
    values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      username,
      name,
      email,
      phoneNumber,
      hashedPassword,
      orphanageId,
      address,
      nic,
      gender,
      dob,
    ]
  );
};

export const getUserByIdAsync = async (id) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `SELECT * FROM "User" WHERE "Id" = $1`,
    [id]
  );
};

export const updateUserAsync = async ({
  id,
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
}) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `UPDATE "User" SET
    "Username"=$1, "Name"=$2, "Email"=$3,"PhoneNumber"=$4,
    "PasswordHash"=$5, "OrphanageId"=$6, "Address"=$7,
    "NIC"=$8, "Gender"=$9, "DOB"=$10 WHERE "Id" = $11 RETURNING *`,
    [
      username,
      name,
      email,
      phoneNumber,
      hashedPassword,
      orphanageId,
      address,
      nic,
      gender,
      dob,
      id,
    ]
  );
};

export const getRolesAsync = async () => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `SELECT * FROM "Role"`,
    []
  );
};

export const createRoleAsync = async ({ roleName }) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `INSERT INTO "Role"("Name") values ($1) RETURNING *`,
    [roleName]
  );
};

export const deleteRoleAsync = async ({ id }) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `DELETE FROM "Role" WHERE "Id" = $1 RETURNING *`,
    [id]
  );
};

export const updateRoleAsync = async ({ id, roleName }) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `UPDATE "Role" SET "Name" = $1 WHERE "Id" = $2 RETURNING *`,
    [roleName, id]
  );
};

export const assignUserToRoleAsync = async ({ userId, roleId }) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `INSERT INTO "UserRole"("UserId", "RoleId") values ($1, $2) RETURNING *`,
    [userId, roleId]
  );
};

export const getUsersInRoleAsync = async (roleId) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `SELECT * FROM "User" WHERE "Id" in (SELECT "UserId" FROM "UserRole" WHERE "RoleId" = $1)`,
    [roleId]
  );
};

export const getRolesOfUserAsync = async (userId) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `SELECT * FROM "Role" WHERE "Id" in (SELECT "RoleId" FROM "UserRole" WHERE "UserId" = $1)`,
    [userId]
  );
};

export const registerOrphanageAsync = async ({
  name,
  registeredDate,
  capacity,
  registrationId,
  city,
  district,
  founderName,
  address,
  phoneNumber,
  email,
  user_email,
  user_username,
  user_name,
  user_phoneNumber,
  user_address,
  user_nic,
  user_gender,
  user_dob
}) => {
  return await DatabaseHandler.executeTransaction(async (client) => {

    const orphResults = await getOrphanageByRegistrationIdAsync(registrationId);

    if (orphResults.length > 0) {
      throw new Error("orphanage already registered");
    }
    // insert section
    const result1 = await client.query(
      `INSERT INTO "Orphanage"(
        "RegistrationId", "Name", "Capacity", "RegDate", "City", "District", "FounderName", "Address", "PhoneNumber", "Email")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING "Id";`,
      [
        registrationId,
        name,
        capacity,
        registeredDate,
        city,
        district,
        founderName,
        address,
        phoneNumber,
        email,
      ]
    );

    const userResults = await getUserByEmailAsync(user_email);

    if (userResults.length > 0) {
      throw new Error("user already registered for an orphanage");
    }

    const newOrphanageId = result1.rows[0]['Id'];
    if (!newOrphanageId) {
      throw new Error("orphanage not created");
    }

    const hashedPassword = await generatePassword('admin123');

    const result2 = await client.query(
      `INSERT INTO "User"(
       "Username", "Name", "Email","PhoneNumber", "OrphanageId", "Address", "NIC",
       "Gender", "DOB", "PasswordHash")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING "Id";`,
      [
        user_username,
        user_name,
        user_email,
        user_phoneNumber,
        newOrphanageId,
        user_address,
        user_nic,
        user_gender,
        user_dob,
        hashedPassword,
      ]
    );

    const newUserId = result2.rows[0]['Id'];

    const roleResult = await client.query(
      `SELECT * FROM "Role" WHERE "Name" = $1 LIMIT 1;`,
      ['orphanageManager']
    )

    await client.query(
      `INSERT INTO "UserRole"("UserId", "RoleId") values ($1, $2) RETURNING *`,
      [newUserId, roleResult.rows[0]['Id']]
    )

    return {
      createdUserId: newUserId,
      createdOrphanageId: newOrphanageId
    };
  });
};
