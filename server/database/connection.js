import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'shoedbserver.mysql.database.azure.com',
  user: process.env.DB_USER || 'root123',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'cleaning_service',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
 
};

const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
  });

export default pool;