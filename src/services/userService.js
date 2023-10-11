import DatabaseHandler from "../lib/database/DatabaseHandler.js";
import { generatePassword } from "../utils/index.js";
import {
  RPCRequest,
  createChannel,
  publishMessage,
} from "../lib/rabbitmq/index.js";
import {
  DOCUMENT_SERVICE_RPC,
  NOTIFICATION_SERVICE_BINDING_KEY,
} from "../config/index.js";
import { uploadSingleFileAsync } from "../lib/aws/index.js";

export const getUserByEmailAsync = async (email) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    'SELECT * FROM "User" WHERE "Email" = $1 LIMIT 1',
    [email]
  );
};

export const registerUserAsync = async ({
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
}) => {
  const results = await getUserByEmailAsync(email);

  if (results.length > 0) {
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
    return results[0];
  }
};

export const getOrphanageByRegistrationIdAsync = async (regId) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    'SELECT * FROM "Orphanage" WHERE "RegistrationId" = $1 LIMIT 1',
    [regId]
  );
};

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
  name,
  phoneNumber,
  orphanageId,
  address,
  nic,
  gender,
  dob,
}) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `UPDATE "User" SET
    "Name"=$1, "Email"=$2,"PhoneNumber"=$3,
    "OrphanageId"=$4, "Address"=$5,
    "NIC"=$6, "Gender"=$7, "DOB"=$8 WHERE "Id" = $9 RETURNING *`,
    [
      name,
      email,
      phoneNumber,    
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

export const registerOrphanageAsync = async (
  files,
  {
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
    user_dob,
  }
) => {
  // await RPCRequest(DOCUMENT_SERVICE_RPC, {event: "UPLOAD_FILES", data: {path: `test/test`, files: files}})

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

    const newOrphanageId = result1.rows[0]["Id"];
    if (!newOrphanageId) {
      throw new Error("orphanage not created");
    }
    for (const fieldName in files) {
      const file = files[fieldName][0];
      await uploadSingleFileAsync(
        `orphanageFiles/${newOrphanageId}/${fieldName}/`,
        file
      );
    }

    const hashedPassword = await generatePassword("admin123");

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

    const newUserId = result2.rows[0]["Id"];

    const roleResult = await client.query(
      `SELECT * FROM "Role" WHERE "Name" = $1 LIMIT 1;`,
      ["orphanageManager"]
    );

    await client.query(
      `INSERT INTO "UserRole"("UserId", "RoleId") values ($1, $2) RETURNING *`,
      [newUserId, roleResult.rows[0]["Id"]]
    );

    publishMessage(await createChannel(), NOTIFICATION_SERVICE_BINDING_KEY, {
      event: "SEND_EMAIL",
      data: {
        receiverEmail: user_email,
        subject: "Orphansafe Email Verficiation",
        emailContent: {
          body: {
            name: user_name,
            intro: `Welcome ${user_username}, Please verify your email: ${user_email}`,
            action: {
              instructions:
                `click the verify email link, and verify your email with us,
                 Your Autogenerated Password : admin123. 
                 please change the password after you logged in for the first time.`,
              button: {
                color: "#0d8aa3",
                text: "Verify Email",
                link: `https://orphansafe-management.ecodeit.com/api/users/verifyEmail?email=${user_email}`,
              },
            },
            outro:
              "If you did not request a email verification, no further action is required on your part.",
          },
        },
      },
    });

    return {
      createdUserId: newUserId,
      createdOrphanageId: newOrphanageId,
    };
  });
};

export const verifyEmailAsync = async (email) => {
  await DatabaseHandler.executeSingleQueryAsync(
    `UPDATE "User" SET "EmailConfirmed" = 'true' WHERE "Email" = $1`,
    [email]
  );
};
