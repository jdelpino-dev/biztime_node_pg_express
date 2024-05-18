/** Database setup for BizTime. */

import pg from "pg";

const { Client } = pg;
const client = new Client({
  connectionString: "postgresql:///biztime",
});

await client.connect();

export { Client, client };
