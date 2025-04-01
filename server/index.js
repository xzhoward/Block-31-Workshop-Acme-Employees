const express = require('express');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, '../dist')));
 
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
 
app.get('/api/employees', async (req, res, next) => {
  try {
    const result = await client.query('SELECT * FROM employees');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});
 
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

 
const init = async () => {
  try {
    await client.connect();
    console.log('✅ Connected to database.');

    await client.query(`
      DROP TABLE IF EXISTS employees;
      CREATE TABLE employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        is_admin BOOLEAN DEFAULT false
      );

      INSERT INTO employees (name, is_admin) VALUES
        ('Alice', true),
        ('Bob', false),
        ('Charlie', false);
    `);

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error during init:', err);
  }
};

init();
