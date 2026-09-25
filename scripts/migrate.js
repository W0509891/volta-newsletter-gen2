import path from "path";
import fs from "fs";
import {Client} from "pg";


async function migrate() {
  const sql = fs.readFileSync(path.join(process.cwd(), 'lib/db/schema.sql'), 'utf8');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to DB, running schema.sql...');
  await client.query(sql);
  console.log('Schema applied successfully!');
  await client.end();
}

migrate().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
