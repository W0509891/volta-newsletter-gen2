import path from "path";
import fs from "fs";
import { Client } from "pg";

const migrationDir = path.join(process.cwd(), 'lib/db/');
const files = fs.readdirSync(migrationDir);
const sqlFiles = files
  .filter((file) => file.endsWith('.sql'))
  .sort((a, b) => {
    if (a === 'schema.sql') return -1;
    if (b === 'schema.sql') return 1;
    return a.localeCompare(b);
  });

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to DB, running migrations...');

  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      migration VARCHAR(255),
      name VARCHAR(255),
      date_applied TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      sql TEXT
    )
  `);

  const res = await client.query(`SELECT migration FROM migrations`);
  const appliedMigrations = new Set(res.rows.map((row) => row.migration));

  for (const file of sqlFiles) {
    if (appliedMigrations.has(file)) {
      console.log(`Skipping ${file} (already applied).`);
      continue;
    }

    console.log(`Applying ${file}...`);
    const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
    await client.query(sql);
    console.log(`Applied ${file} successfully.`);
    await client.query(
      `INSERT INTO migrations (migration, name, sql) VALUES ($1, $2, $3)`,
      [file, file, sql]
    );
  }

  console.log('All migrations applied successfully!');
  await client.end();
}

migrate().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
