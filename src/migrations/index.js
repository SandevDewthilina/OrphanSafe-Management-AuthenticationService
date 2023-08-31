import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { POSTGRESQL_DATABASE } from "../config/index.js";
import DatabaseHandler from "../lib/database/DatabaseHandler.js";

const readSqlFilesInDirectory = (directoryPath) => {
  // Get a list of files in the directory
  const files = fs.readdirSync(directoryPath);

  // Filter for SQL files (assuming they have a .sql extension)
  const sqlFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === ".sql"
  );

  // Read the content of each SQL file
  let sqlContents = "";
  sqlFiles.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const content = fs.readFileSync(filePath, "utf-8");
    sqlContents += content + "\n";
  });

  return sqlContents;
};

export const runMigrations = async () => {
  // Get the URL of the current module
  const currentModuleUrl = import.meta.url;

  // Convert the URL to a file path
  const currentModulePath = fileURLToPath(currentModuleUrl);

  // Get the directory path of the current module
  const currentModuleDirectory = dirname(currentModulePath);
  const scriptDirectory = path.join(currentModuleDirectory, "scripts");
  const sqlContents = readSqlFilesInDirectory(scriptDirectory);

  // create database if not exists
  await DatabaseHandler.executeSingleQueryAsync(sqlContents, []);
  console.log(sqlContents);
};
