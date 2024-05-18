const pg = require("pg");

const { Client } = pg;
const client = new Client({
  connectionString: "postgresql:///biztime",
});

async function main() {
  await client.connect();
  // Call your functions here
}

main().catch((err) => console.error(err));
