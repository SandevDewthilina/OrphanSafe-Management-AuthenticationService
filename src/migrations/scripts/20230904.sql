CREATE TABLE "ChildProfile" (
  "Id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "FirstName" varchar(225) NOT NULL,
  "MiddleNames" varchar(225),
  "LastName" varchar(225),
  "DateOfBirth" timestamp NOT NULL,
  "Gender" varchar(20) NOT NULL,
  "DateOfAdmission" date NOT NULL,
  "DateOfEntry" date NOT NULL,
  "Country" varchar(25) NOT NULL,
  "City" varchar(225) NOT NULL,
  "GuardianInfo" varchar(225),
  "GuardianId" UUID NOT NULL,
  CONSTRAINT "FK_ChildProfile.GuardianId"
    FOREIGN KEY ("GuardianId")
      REFERENCES "User"("Id") ON DELETE CASCADE
);

CREATE TYPE approval_status AS ENUM ('CREATED', 'DELETED', 'ACCEPT', 'REJECT');

CREATE TABLE "ApprovalLog" (
  "Id" SERIAL PRIMARY KEY,
  "State" approval_status NOT NULL DEFAULT 'CREATED',
  "ReviewedBy" uuid,
  "CreatedBy" uuid NOT NULL,
  CONSTRAINT "FK_ApprovalLog.CreatedBy"
    FOREIGN KEY ("CreatedBy")
      REFERENCES "User"("Id") ON DELETE CASCADE,
  CONSTRAINT "FK_ApprovalLog.ReviewedBy"
    FOREIGN KEY ("ReviewedBy")
      REFERENCES "User"("Id") ON DELETE CASCADE
);

CREATE TABLE "Funding" (
  "Id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "ExternalPartyId" uuid NOT NULL,
  "TransactionDateTime" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "TransactionAmount" float NOT NULL,
  "ApprovalLogId" int NOT NULL,
  "DocumentCollectionId" int,
  CONSTRAINT "FK_Funding.ExternalPartyId"
    FOREIGN KEY ("ExternalPartyId")
      REFERENCES "User"("Id") ON DELETE CASCADE
);

CREATE TABLE "DocumentCollection" (
  "Id" int PRIMARY KEY,
  "CollectionName" varchar(225) NOT NULL
);

CREATE TABLE "Document" (
  "Id" int PRIMARY KEY,
  "Filename" varchar(225) NOT NULL,
  "CreatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "CreatedBy" uuid NOT NULL,
  "DeletedAt" timestamp,
  "DeletedBy" uuid,
  CONSTRAINT "FK_Document.DeletedBy"
    FOREIGN KEY ("DeletedBy")
      REFERENCES "User"("Id") ON DELETE CASCADE,
  CONSTRAINT "FK_Document.Id"
    FOREIGN KEY ("Id")
      REFERENCES "DocumentCollection"("Id") ON DELETE CASCADE,
  CONSTRAINT "FK_Document.CreatedBy"
    FOREIGN KEY ("CreatedBy")
      REFERENCES "User"("Id") ON DELETE CASCADE
);

CREATE TABLE "SocialWorkerChildMapping" (
  "ChildProfileId" uuid,
  "SocialWorkerId" uuid,
  PRIMARY KEY ("ChildProfileId", "SocialWorkerId"),
  CONSTRAINT "FK_SocialWorkerChildMapping.SocialWorkerId"
    FOREIGN KEY ("SocialWorkerId")
      REFERENCES "User"("Id") ON DELETE CASCADE,
  CONSTRAINT "FK_SocialWorkerChildMapping.ChildProfileId"
    FOREIGN KEY ("ChildProfileId")
      REFERENCES "ChildProfile"("Id") ON DELETE CASCADE
);

CREATE TABLE "ProfileVersion" (
  "ChildProfileId" uuid PRIMARY KEY,
  "ProfileData" varchar(225) NOT NULL,
  "CommitMessage" varchar(225) NOT NULL,
  "CommittedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "CommittedBy" uuid NOT NULL,
  CONSTRAINT "FK_ProfileVersion.CommittedBy"
    FOREIGN KEY ("CommittedBy")
      REFERENCES "User"("Id") ON DELETE CASCADE,
  CONSTRAINT "FK_ProfileVersion.ChildProfileId"
    FOREIGN KEY ("ChildProfileId")
      REFERENCES "ChildProfile"("Id") ON DELETE CASCADE
);

