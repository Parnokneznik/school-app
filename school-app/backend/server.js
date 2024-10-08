const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Připojení k databázi
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'suchy',
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to database');
  }
});

// Načtení všech tříd
app.get('/classes', (req, res) => {
  db.query('SELECT * FROM classes', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Načtení žáků podle třídy
app.get('/students', (req, res) => {
  const classId = req.query.class_id;
  db.query('SELECT * FROM students WHERE class_id = ?', [classId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Přidání nového žáka
app.post('/students', (req, res) => {
  const { name, class_id } = req.body;
  db.query('INSERT INTO students (name, class_id) VALUES (?, ?)', [name, class_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Student added', studentId: result.insertId });
  });
});

// Přidání známky žákovi
app.post('/grades', (req, res) => {
  const { student_id, grade, weight, description } = req.body;
  db.query('INSERT INTO grades (student_id, grade, weight, description) VALUES (?, ?, ?, ?)', 
  [student_id, grade, weight, description], 
  (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Grade added' });
  });
});

// Výpočet průměru žáka
app.get('/students/:id/average', (req, res) => {
  const student_id = req.params.id;
  db.query('SELECT AVG(grade) AS average FROM grades WHERE student_id = ?', [student_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
});

// Smazání známky
app.delete('/grades/:id', (req, res) => {
  const grade_id = req.params.id;
  db.query('DELETE FROM grades WHERE id = ?', [grade_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Grade deleted' });
  });
});

// Smazání žáka
app.delete('/students/:id', (req, res) => {
  const student_id = req.params.id;
  db.query('DELETE FROM students WHERE id = ?', [student_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Student deleted' });
  });
});

// Endpoint pro získání známek pro konkrétního žáka
app.get('/students/:id/grades', (req, res) => {
  const student_id = req.params.id;
  db.query('SELECT * FROM grades WHERE student_id = ?', [student_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
