import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5001;
export const NODE_ENV = process.env.NODE_ENV;
export const JWT_SECRET = process.env.JWT_SECRET;
export const POSTGRESQL_HOST = process.env.POSTGRESQL_HOST;
export const POSTGRESQL_PORT = process.env.POSTGRESQL_PORT;
export const POSTGRESQL_USERNAME = process.env.POSTGRESQL_USERNAME;
export const POSTGRESQL_DATABASE = process.env.POSTGRESQL_DATABASE;
export const POSTGRESQL_PASSWORD = process.env.POSTGRESQL_PASSWORD;
export const MESSAGE_BROKER_URL = process.env.MESSAGE_BROKER_URL;
export const EXCHANGE_NAME = process.env.EXCHANGE_NAME;
export const AUTH_SERVICE_BINDING_KEY = process.env.AUTH_SERVICE_BINDING_KEY;
export const AUTH_SERVICE_RPC = process.env.AUTH_SERVICE_RPC;
export const PROFILE_SERVICE_BINDING_KEY =
  process.env.PROFILE_SERVICE_BINDING_KEY;
export const PROFILE_SERVICE_RPC = process.env.PROFILE_SERVICE_RPC;
export const NOTIFICATION_SERVICE_BINDING_KEY =
  process.env.NOTIFICATION_SERVICE_BINDING_KEY;
export const NOTIFICATION_SERVICE_RPC = process.env.NOTIFICATION_SERVICE_RPC;
export const DOCUMENT_SERVICE_BINDING_KEY =
  process.env.DOCUMENT_SERVICE_BINDING_KEY;
export const DOCUMENT_SERVICE_RPC = process.env.DOCUMENT_SERVICE_RPC;
