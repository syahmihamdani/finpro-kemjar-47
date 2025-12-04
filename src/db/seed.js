// Seed script to create users with properly hashed passwords
// Run this after schema.sql: node src/db/seed.js

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../server/.env' });

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'learnify',
  password: process.env.PG_PASSWORD || 'postgres',
  port: process.env.PG_PORT || 5432,
});

async function seed() {
  try {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Seeding users with password:', password);
    console.log('Hash:', hashedPassword);
    
    // Clear existing users (optional - comment out if you want to keep existing data)
    await pool.query('DELETE FROM users WHERE username IN ($1, $2, $3, $4)', 
      ['admin', 'lecturer1', 'student1', 'student2']);
    
    // Insert users with properly hashed passwords
    await pool.query(`
      INSERT INTO users (username, email, password, role, full_name) VALUES
      ($1, $2, $3, $4, $5),
      ($6, $7, $3, $8, $9),
      ($10, $11, $3, $12, $13),
      ($14, $15, $3, $12, $16)
      ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password
    `, [
      'admin', 'admin@learnify.edu', hashedPassword, 'admin', 'Admin User',
      'lecturer1', 'lecturer1@learnify.edu', hashedPassword, 'lecturer', 'Dr. John Smith',
      'student1', 'student1@learnify.edu', hashedPassword, 'student', 'Alice Johnson',
      'student2', 'student2@learnify.edu', hashedPassword, 'student', 'Bob Williams'
    ]);
    
    console.log('Users seeded successfully!');
    
    // Initialize classes and assignments
    const lecturerResult = await pool.query("SELECT id FROM users WHERE username = 'lecturer1'");
    if (lecturerResult.rows.length > 0) {
      const lecturerId = lecturerResult.rows[0].id;
      
      // Create class
      const classResult = await pool.query(`
        INSERT INTO classes (name, code, description, lecturer_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `, ['Network Security', 'NETSEC101', 'Introduction to Network Security and Penetration Testing', lecturerId]);
      
      const classId = classResult.rows[0].id;
      
      // Enroll students
      const students = await pool.query("SELECT id FROM users WHERE role = 'student'");
      for (const student of students.rows) {
        await pool.query(`
          INSERT INTO class_enrollments (class_id, student_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [classId, student.id]);
      }
      
      // Create assignment
      await pool.query(`
        INSERT INTO assignments (class_id, title, description, due_date, created_by)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [
        classId,
        'Assignment 1: Security Analysis',
        'Upload your security analysis report. Make sure to include all findings.',
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        lecturerId
      ]);
      
      console.log('Classes and assignments initialized!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

