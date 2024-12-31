const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors package
const path = require('path');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors({
  origin: 'https://izify0665.github.io/notepad-web/' // replace with the URL of your frontend
}));


// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL database connection
const db = mysql.createConnection(process.env.CLEARDB_DATABASE_URL || {
  host: 'localhost',
  user: 'root',  // default MySQL username in XAMPP is 'root'
  password: '',  // default MySQL password in XAMPP is ''
  database: 'notepad'  // make sure 'notepad' exists locally in your MySQL
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// API endpoint to get all notes
app.get('/notes', (req, res) => {
  db.query('SELECT * FROM notes ORDER BY created_at DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// API endpoint to add a new note
app.post('/notes', (req, res) => {
  const { title, content } = req.body;
  const query = 'INSERT INTO notes (title, content) VALUES (?, ?)';
  db.query(query, [title, content], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Note added successfully', id: result.insertId });
  });
});

// API endpoint to delete a note
app.delete('/notes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM notes WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Note deleted successfully' });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
