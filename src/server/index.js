const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.PG_USER || "postgres",
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DATABASE || "learnify",
  password: process.env.PG_PASSWORD || "postgres",
  port: process.env.PG_PORT || 5432,
});

const app = express();
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// VULNERABLE FILE UPLOAD CONFIGURATION
// No file type validation, no MIME type checking, no content validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // VULNERABILITY: Accepts any filename without sanitization
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  // VULNERABILITY: No fileFilter to restrict file types
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Simple session storage (in production, use proper sessions)
const sessions = {};

// Authentication middleware (simplified for pentesting)
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = sessions[token];
  next();
};

// ==================== AUTHENTICATION ENDPOINTS ====================

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;
    
    // Simple password hashing (vulnerable to timing attacks, but okay for pentesting)
    const hashedPassword = await bcrypt.hash(password || "password123", 10);
    
    const result = await pool.query(
      "INSERT INTO users (username, email, password, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, full_name",
      [username, email, hashedPassword, full_name, role || "student"]
    );
    
    res.json({ message: "User created", user: result.rows[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $1",
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password || "password123", user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Create simple session token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessions[token] = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    };
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CLASS ENDPOINTS ====================

// Helper to auto-generate a class code if not provided
function generateClassCode(name) {
  const prefix = (name || "CLASS")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4) || "CLS";
  const suffix = Math.floor(100 + Math.random() * 900); // 3 digits
  return `${prefix}${suffix}`;
}

app.get("/api/classes", authenticate, async (req, res) => {
  try {
    let query;
    let params;
    
    if (req.user.role === "student") {
      query = `
        SELECT c.*, u.full_name as lecturer_name
        FROM classes c
        JOIN class_enrollments ce ON c.id = ce.class_id
        JOIN users u ON c.lecturer_id = u.id
        WHERE ce.student_id = $1
      `;
      params = [req.user.id];
    } else {
      query = `
        SELECT c.*, u.full_name as lecturer_name
        FROM classes c
        JOIN users u ON c.lecturer_id = u.id
        WHERE c.lecturer_id = $1 OR $2 = 'admin'
      `;
      params = [req.user.id, req.user.role];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new class (lecturer or admin only)
app.post("/api/classes", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "lecturer" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only lecturers or admins can create classes" });
    }

    const { name, code, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // If no code is provided, auto-generate one
    const classCode = code && code.trim() ? code.trim().toUpperCase() : generateClassCode(name);

    const result = await pool.query(
      "INSERT INTO classes (name, code, description, lecturer_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, classCode, description || "", req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Student joins a class by code
app.post("/api/classes/join", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Only students can join classes" });
    }

    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Class code is required" });
    }

    const classResult = await pool.query(
      "SELECT id FROM classes WHERE code = $1",
      [code]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }

    const classId = classResult.rows[0].id;

    await pool.query(
      "INSERT INTO class_enrollments (class_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [classId, req.user.id]
    );

    res.json({ message: "Enrolled in class", class_id: classId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/classes/:id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT c.*, u.full_name as lecturer_name, u.email as lecturer_email FROM classes c JOIN users u ON c.lecturer_id = u.id WHERE c.id = $1",
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List students enrolled in a class
app.get("/api/classes/:id/students", authenticate, async (req, res) => {
  try {
    const classId = req.params.id;

    // Check that class exists and get lecturer
    const classResult = await pool.query(
      "SELECT * FROM classes WHERE id = $1",
      [classId]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }

    const classRow = classResult.rows[0];

    // Authorization: lecturer of class, admin, or enrolled student
    if (req.user.role === "lecturer" && classRow.lecturer_id !== req.user.id) {
      return res.status(403).json({ error: "You are not the lecturer for this class" });
    }

    if (req.user.role === "student") {
      const enrollment = await pool.query(
        "SELECT 1 FROM class_enrollments WHERE class_id = $1 AND student_id = $2",
        [classId, req.user.id]
      );
      if (enrollment.rows.length === 0) {
        return res.status(403).json({ error: "You are not enrolled in this class" });
      }
    }

    // Admin can see all classes

    const result = await pool.query(
      `SELECT u.id, u.full_name, u.username, u.email, ce.enrolled_at
       FROM class_enrollments ce
       JOIN users u ON ce.student_id = u.id
       WHERE ce.class_id = $1
       ORDER BY u.full_name`,
      [classId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ASSIGNMENT ENDPOINTS ====================

// List assignments for a class
app.get("/api/classes/:classId/assignments", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM assignments WHERE class_id = $1 ORDER BY created_at DESC",
      [req.params.classId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create assignment for a class (lecturer/admin)
app.post("/api/classes/:classId/assignments", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "lecturer" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only lecturers or admins can create assignments" });
    }

    const { title, description, due_date } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Optional: ensure lecturer owns the class (or is admin)
    const classResult = await pool.query(
      "SELECT * FROM classes WHERE id = $1",
      [req.params.classId]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }

    const classRow = classResult.rows[0];
    if (
      req.user.role === "lecturer" &&
      classRow.lecturer_id !== req.user.id
    ) {
      return res.status(403).json({ error: "You are not the lecturer for this class" });
    }

    const result = await pool.query(
      "INSERT INTO assignments (class_id, title, description, due_date, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.params.classId, title, description || "", due_date || null, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single assignment details
app.get("/api/assignments/:id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM assignments WHERE id = $1",
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== VULNERABLE FILE UPLOAD ENDPOINT ====================
// VULNERABILITY: Insecure File Upload
// - No file extension validation
// - No MIME type checking
// - No content validation
// - Accepts any file type including .php, .jsp, .exe, etc.

app.post("/api/assignments/:assignmentId/submit", authenticate, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    // VULNERABILITY: Directly using the original filename without sanitization
    const fileName = req.file.originalname;
    const filePath = req.file.path;
    
    // Save submission to database
    const result = await pool.query(
      "INSERT INTO submissions (assignment_id, student_id, file_name, file_path) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.params.assignmentId, req.user.id, fileName, filePath]
    );
    
    res.json({
      message: "File uploaded successfully",
      submission: result.rows[0],
      file_path: filePath, // VULNERABILITY: Exposing file path
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== VULNERABLE FILE VIEWING/INCLUSION ENDPOINT ====================
// VULNERABILITY: Local File Inclusion (LFI)
// - No path traversal protection
// - Directly includes files based on user input
// - Can be used to read sensitive files or execute uploaded malicious files

app.get("/api/files/view", authenticate, (req, res) => {
  try {
    // VULNERABILITY: Directly using user input without sanitization
    const filePath = req.query.path;
    
    if (!filePath) {
      return res.status(400).json({ error: "File path is required" });
    }
    
    // VULNERABILITY: No path traversal protection (../../../etc/passwd)
    // VULNERABILITY: No whitelist of allowed directories
    const fullPath = path.join(__dirname, filePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "File not found" });
    }
    
    // VULNERABILITY: Reading file without checking if it's a directory
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      return res.status(400).json({ error: "Path is a directory" });
    }
    
    // VULNERABILITY: For PHP files or other executable files, this could lead to RCE
    // In a real scenario with PHP, this would execute the file
    // For Node.js, we'll read and return the content, but in a real LFI scenario,
    // this would be used with file inclusion in a templating system
    
    const fileContent = fs.readFileSync(fullPath, "utf8");
    
    res.json({
      path: filePath,
      content: fileContent,
      size: stats.size,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alternative LFI endpoint that simulates PHP-like include behavior
app.get("/api/files/include", authenticate, (req, res) => {
  try {
    // VULNERABILITY: LFI - includes file based on user input
    const includePath = req.query.include;
    
    if (!includePath) {
      return res.status(400).json({ error: "Include path is required" });
    }
    
    // VULNERABILITY: No validation - can include any file
    // In a real PHP application, this would be something like:
    // include($_GET['page'] . '.php');
    
    const fullPath = path.join(__dirname, "uploads", includePath);
    
    // VULNERABILITY: Path traversal possible: ../../../etc/passwd
    // For demonstration, we'll allow reading from uploads directory
    // but path traversal can escape to other directories
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "File not found" });
    }
    
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      return res.status(400).json({ error: "Path is a directory" });
    }
    
    // Read and return file content
    // In a real PHP scenario, this would execute PHP code
    const fileContent = fs.readFileSync(fullPath, "utf8");
    
    res.json({
      included: includePath,
      content: fileContent,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SUBMISSION ENDPOINTS ====================

app.get("/api/assignments/:assignmentId/submissions", authenticate, async (req, res) => {
  try {
    // Check if user is lecturer or admin
    if (req.user.role !== "lecturer" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    const result = await pool.query(
      `SELECT s.*, u.full_name as student_name, u.email as student_email 
       FROM submissions s 
       JOIN users u ON s.student_id = u.id 
       WHERE s.assignment_id = $1 
       ORDER BY s.submitted_at DESC`,
      [req.params.assignmentId]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/submissions/my", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, a.title as assignment_title, a.class_id, c.name as class_name
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN classes c ON a.class_id = c.id
       WHERE s.student_id = $1
       ORDER BY s.submitted_at DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STATIC FILE SERVING ====================

app.use("/uploads", express.static(uploadsDir));

// ==================== SERVER START ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
  console.log("⚠️  VULNERABLE SYSTEM - FOR PENTESTING ONLY");
});
