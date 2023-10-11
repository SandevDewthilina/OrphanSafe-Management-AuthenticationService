import pg from "pg";
import {
  POSTGRESQL_HOST,
  POSTGRESQL_USERNAME,
  POSTGRESQL_DATABASE,
  POSTGRESQL_PASSWORD,
  POSTGRESQL_PORT,
} from "../../config/index.js";

class DatabaseHandler {
  static pool = null;

  static getPool() {
    if (this.pool === null) {
      this.pool = new pg.Pool({
        host: POSTGRESQL_HOST,
        user: POSTGRESQL_USERNAME,
        database: POSTGRESQL_DATABASE,
        password: POSTGRESQL_PASSWORD,
        port: POSTGRESQL_PORT,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    }
    return this.pool;
  }

  static executeSingleQueryAsync = async (query, args) => {
    const pool = this.getPool();
    const result = await pool.query(query, args);
    console.warn("DB QUERY: ", query, args);
    return result.rows;
  };

  // TODO
  static executeTransaction = async (logic) => {
    const client = await this.getPool().connect();
    let results;
    try {
      await client.query("BEGIN");
      results = await logic(client);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
    return results;
  };

  // TODO
  static runMigrations() {}
}

export default DatabaseHandler;
