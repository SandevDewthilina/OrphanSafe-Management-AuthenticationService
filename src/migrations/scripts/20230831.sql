CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "User"
(
    "Id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "Username" varchar(225),
    "Name" varchar(225),
    "Email" varchar(225),
    "EmailConfirmed" boolean DEFAULT false,
    "PhoneNumber" integer,
    "PasswordHash" varchar(225)
);

CREATE TABLE "Role"
(
    "Id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "Name" varchar(225)
);

CREATE TABLE "UserRole" (
  "UserId" uuid,
  "RoleId" uuid,
  PRIMARY KEY ("UserId", "RoleId"),
  FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE CASCADE,
  FOREIGN KEY ("RoleId") REFERENCES "Role"("Id") ON DELETE CASCADE
);

INSERT INTO "User" (
"Username", "Name", "Email", "PhoneNumber", "PasswordHash") VALUES (
'admin'::character varying, 'admin'::character varying, 'admin@orphansafe.com'::character varying, '0764893581'::integer, '$2a$10$xNDVyyRDsOVUE85kXuUXwOiRSjxmqNS04vHmuwOgLrrarfpgPomg6'::character varying)
 returning "Id";