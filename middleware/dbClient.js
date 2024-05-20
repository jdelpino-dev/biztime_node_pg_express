// ./middleware/dbMiddleware.js
import {
  beginTransactions,
  commitTransactions,
  rollbackTransactions,
} from "../db.js";

/**
 * Middleware to initialize a database client for each request.
 * The client is attached to the req object and a transaction is started.
 * On response finish, the transaction is committed or rolled back based on
 * whether an error occurred.
 */
async function dbClient(req, res, next) {
  try {
    // Begin a new transaction and attach the client to the request object
    const client = await beginTransactions();
    req.dbClient = client;

    // Commit the transaction if the response is successful
    res.on("finish", async () => {
      if (res.statusCode < 400) {
        await commitTransactions(client);
      } else {
        await rollbackTransactions(client);
      }
      client.release();
    });

    next();
  } catch (err) {
    next(err);
  }
}

export default dbClient;
