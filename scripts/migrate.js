#!/usr/bin/env node
// scripts/migrate.js — Run database migrations
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running schema migration...');
    const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✓ Schema applied');

    const seed = process.argv.includes('--seed');
    if (seed) {
      const seedSql = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf8');
      await client.query(seedSql);
      console.log('✓ Seed data applied');
    }

    console.log('✓ Migration complete');
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
