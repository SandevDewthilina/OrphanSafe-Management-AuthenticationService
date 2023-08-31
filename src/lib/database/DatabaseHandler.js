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
  static executeTransaction = async () => {
    // const client = await this.getPool().connect();
    // try {
    //   await client.query("BEGIN");
    //   const queryText = "INSERT INTO users(name) VALUES($1) RETURNING id";
    //   const res = await client.query(queryText, ["brianc"]);
    //   const insertPhotoText =
    //     "INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)";
    //   const insertPhotoValues = [res.rows[0].id, "s3.bucket.foo"];
    //   await client.query(insertPhotoText, insertPhotoValues);
    //   await client.query("COMMIT");
    // } catch (e) {
    //   await client.query("ROLLBACK");
    //   throw e;
    // } finally {
    //   client.release();
    // }
  };

  // TODO
  static runMigrations() {}
}

export default DatabaseHandler;
