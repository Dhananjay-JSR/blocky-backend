import { db, connection } from './db';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
// This will run migrations on the database, skipping the ones already applied

// Don't forget to close the connection, otherwise the script will hang



async function runMigrate() {
  
    console.log("Running migrations...");
  
    const start = Date.now();
    await migrate(db, { migrationsFolder: './drizzle' });
    const end = Date.now();
  
    console.log(`✅ Migrations completed in ${end - start}ms`);
    await connection.close();
    process.exit(0);
  }