const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create test database if it doesn't exist
async function setupTestDatabase() {
  const adminPool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    password: process.env.POSTGRES_PASSWORD || 'newpassword',
    port: process.env.POSTGRES_PORT || 5432,
    database: 'postgres' // Connect to default postgres database first
  });

  try {
    // Check if test database exists
    const result = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'ecommercestore_test'"
    );

    if (result.rows.length === 0) {
      // Create test database
      await adminPool.query('CREATE DATABASE ecommercestore_test');
      console.log('Test database created successfully');
    } else {
      console.log('Test database already exists');
    }
  } catch (error) {
    console.error('Error setting up test database:', error.message);
  } finally {
    await adminPool.end();
  }

  // Now connect to the test database and run the schema
  const testPool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    password: process.env.POSTGRES_PASSWORD || 'newpassword',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB_TEST || 'ecommercestore_test'
  });

  try {
    // Check if tables already exist
    const tablesResult = await testPool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );

    if (tablesResult.rows.length === 0) {
      // Read and execute the init.sql file
      const initSqlPath = path.join(__dirname, 'config', 'init.sql');
      const initSql = fs.readFileSync(initSqlPath, 'utf8');
      
      await testPool.query(initSql);
      console.log('Test database schema initialized successfully');
    } else {
      console.log('Test database schema already exists');
    }
  } catch (error) {
    console.error('Error initializing test database schema:', error.message);
  } finally {
    await testPool.end();
  }
}

setupTestDatabase();
