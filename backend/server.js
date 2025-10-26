const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// PDF Resources API
app.get('/api/resources', (req, res) => {
  try {
    const resourcesPath = path.join(__dirname, '..', 'pdf_resources.json');
    const resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'));
    res.json(resources);
  } catch (error) {
    console.error('Error reading resources:', error);
    res.status(500).json({ error: 'Failed to load resources' });
  }
});

// Serve PDF files individually
app.get('/resources/:filename', (req, res) => {
  const filename = req.params.filename;
  const allowedFiles = ['bsb_concordance.pdf', 'bib.pdf', 'bgb.pdf'];
  
  if (!allowedFiles.includes(filename)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  const filePath = path.join(__dirname, '..', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Test route
app.get('/test', (req, res) => {
  res.send('Server is running!');
});

console.log('About to start server...');
app.listen(PORT, () => {
  console.log(`Bible Study Hub API server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Logging
// app.use(morgan('combined'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the Vue build
// app.use(express.static(path.join(__dirname, 'dist')));

// Session configuration
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000 // 24 hours
//   }
// }));// Passport configuration
// app.use(passport.initialize());
// app.use(passport.session());

// Database setup
const dbPath = path.join(__dirname, 'bible_study.db');
let db;
// try {
//   db = new Database(dbPath);
// } catch (error) {
//   console.error('Database connection error:', error);
//   process.exit(1);
// }

// Create tables
const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(80) UNIQUE NOT NULL,
      email VARCHAR(120) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1,
      default_version VARCHAR(20) DEFAULT 'KJV',
      font_size VARCHAR(10) DEFAULT 'medium'
    )
  `);

  // Notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book VARCHAR(50) NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER,
      note_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      tags VARCHAR(500),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Bookmarks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book VARCHAR(50) NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER,
      title VARCHAR(200),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Highlights table
  db.exec(`
    CREATE TABLE IF NOT EXISTS highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book VARCHAR(50) NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      color VARCHAR(20) DEFAULT 'yellow',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Study guides table
  db.exec(`
    CREATE TABLE IF NOT EXISTS study_guides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      is_template BOOLEAN DEFAULT 0,
      is_public BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Study guide sections table
  db.exec(`
    CREATE TABLE IF NOT EXISTS study_guide_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      study_guide_id INTEGER NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT,
      order_index INTEGER DEFAULT 0,
      section_type VARCHAR(50) DEFAULT 'text',
      book VARCHAR(50),
      chapter INTEGER,
      verse_start INTEGER,
      verse_end INTEGER,
      FOREIGN KEY (study_guide_id) REFERENCES study_guides (id) ON DELETE CASCADE
    )
  `);

  // Greek/Hebrew lexicon table
  db.exec(`
    CREATE TABLE IF NOT EXISTS greek_hebrew_lexicon (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      strongs_number VARCHAR(10) UNIQUE NOT NULL,
      original_word VARCHAR(100) NOT NULL,
      transliteration VARCHAR(100),
      pronunciation VARCHAR(100),
      part_of_speech VARCHAR(50),
      definition TEXT NOT NULL,
      usage TEXT,
      language VARCHAR(10) NOT NULL
    )
  `);

  // Word studies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS word_studies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      strongs_number VARCHAR(10) NOT NULL,
      title VARCHAR(200),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
};

// try {
//   createTables();
//   console.log('Database tables created successfully');
// } catch (error) {
//   console.error('Table creation error:', error);
//   process.exit(1);
// }

// Passport Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'username' },
  (username, password, done) => {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
      const user = stmt.get(username);

      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      if (!bcrypt.compareSync(password, user.password_hash)) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check password
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/user', (req, res) => {
  console.log('Handling /api/auth/user');
  // Temporarily return a mock user for testing
  res.json({ user: { id: 1, username: 'testuser', email: 'test@example.com' } });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    // Create user
    const stmt = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
    const result = stmt.run(username, email, hashedPassword);

    res.status(201).json({ message: 'User created successfully', userId: result.lastInsertRowid });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Helper function to bypass authentication for testing
const requireAuth = (req, res, next) => {
  // Temporarily bypass authentication - set mock user
  req.user = { id: 1, username: 'testuser' };
  next();
};

// Study Tools Routes

// Notes routes
app.get('/api/notes', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC');
    const notes = stmt.all(req.user.id);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.post('/api/notes', requireAuth, (req, res) => {
  try {
    const { book, chapter, verse, note_text, tags } = req.body;
    const stmt = db.prepare('INSERT INTO notes (user_id, book, chapter, verse, note_text, tags) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(req.user.id, book, chapter, verse || null, note_text, tags || null);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Note created successfully' });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.put('/api/notes/:id', requireAuth, (req, res) => {
  try {
    const { note_text, tags } = req.body;
    const stmt = db.prepare('UPDATE notes SET note_text = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?');
    const result = stmt.run(note_text, tags, req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:id', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?');
    const result = stmt.run(req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Bookmarks routes
app.get('/api/bookmarks', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC');
    const bookmarks = stmt.all(req.user.id);
    res.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

app.post('/api/bookmarks', requireAuth, (req, res) => {
  try {
    const { book, chapter, verse, title } = req.body;
    const stmt = db.prepare('INSERT INTO bookmarks (user_id, book, chapter, verse, title) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(req.user.id, book, chapter, verse, title);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Bookmark created successfully' });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
});

app.delete('/api/bookmarks/:id', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM bookmarks WHERE id = ? AND user_id = ?');
    const result = stmt.run(req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    res.json({ message: 'Bookmark deleted successfully' });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
});

// Highlights routes
app.get('/api/highlights', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM highlights WHERE user_id = ? ORDER BY created_at DESC');
    const highlights = stmt.all(req.user.id);
    res.json(highlights);
  } catch (error) {
    console.error('Error fetching highlights:', error);
    res.status(500).json({ error: 'Failed to fetch highlights' });
  }
});

app.post('/api/highlights', requireAuth, (req, res) => {
  try {
    const { book, chapter, verse, color } = req.body;
    const stmt = db.prepare('INSERT INTO highlights (user_id, book, chapter, verse, color) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(req.user.id, book, chapter, verse, color || 'yellow');
    res.status(201).json({ id: result.lastInsertRowid, message: 'Highlight created successfully' });
  } catch (error) {
    console.error('Error creating highlight:', error);
    res.status(500).json({ error: 'Failed to create highlight' });
  }
});

app.delete('/api/highlights/:id', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM highlights WHERE id = ? AND user_id = ?');
    const result = stmt.run(req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Highlight not found' });
    }
    res.json({ message: 'Highlight deleted successfully' });
  } catch (error) {
    console.error('Error deleting highlight:', error);
    res.status(500).json({ error: 'Failed to delete highlight' });
  }
});

// Study Guides routes
app.get('/api/study-guides', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM study_guides WHERE user_id = ? OR is_public = 1 ORDER BY created_at DESC');
    const studyGuides = stmt.all(req.user.id);
    res.json(studyGuides);
  } catch (error) {
    console.error('Error fetching study guides:', error);
    res.status(500).json({ error: 'Failed to fetch study guides' });
  }
});

app.post('/api/study-guides', requireAuth, (req, res) => {
  try {
    const { title, description, is_template, is_public, sections } = req.body;
    const stmt = db.prepare('INSERT INTO study_guides (user_id, title, description, is_template, is_public) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(req.user.id, title, description, is_template || false, is_public || false);
    const guideId = result.lastInsertRowid;

    // Create sections if provided
    if (sections && Array.isArray(sections)) {
      const sectionStmt = db.prepare(`
        INSERT INTO study_guide_sections
        (study_guide_id, title, content, order_index, section_type, book, chapter, verse_start, verse_end)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      sections.forEach((section, index) => {
        sectionStmt.run(
          guideId,
          section.title || '',
          section.content || '',
          section.order_index || index,
          section.section_type || 'text',
          section.book || null,
          section.chapter || null,
          section.verse_start || null,
          section.verse_end || null
        );
      });
    }

    res.status(201).json({ id: guideId, message: 'Study guide created successfully' });
  } catch (error) {
    console.error('Error creating study guide:', error);
    res.status(500).json({ error: 'Failed to create study guide' });
  }
});

app.get('/api/study-guides/:id', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM study_guides WHERE id = ? AND (user_id = ? OR is_public = 1)');
    const studyGuide = stmt.get(req.params.id, req.user.id);
    if (!studyGuide) {
      return res.status(404).json({ error: 'Study guide not found' });
    }

    // Get sections
    const sectionsStmt = db.prepare('SELECT * FROM study_guide_sections WHERE study_guide_id = ? ORDER BY order_index');
    const sections = sectionsStmt.all(req.params.id);

    res.json({ ...studyGuide, sections });
  } catch (error) {
    console.error('Error fetching study guide:', error);
    res.status(500).json({ error: 'Failed to fetch study guide' });
  }
});

app.put('/api/study-guides/:id', requireAuth, (req, res) => {
  try {
    const { title, description, is_public, sections } = req.body;

    // Update study guide
    const stmt = db.prepare('UPDATE study_guides SET title = ?, description = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?');
    const result = stmt.run(title, description, is_public, req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Study guide not found' });
    }

    // Update sections if provided
    if (sections && Array.isArray(sections)) {
      // Delete existing sections
      const deleteStmt = db.prepare('DELETE FROM study_guide_sections WHERE study_guide_id = ?');
      deleteStmt.run(req.params.id);

      // Insert new sections
      const sectionStmt = db.prepare(`
        INSERT INTO study_guide_sections
        (study_guide_id, title, content, order_index, section_type, book, chapter, verse_start, verse_end)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      sections.forEach((section, index) => {
        sectionStmt.run(
          req.params.id,
          section.title || '',
          section.content || '',
          section.order_index || index,
          section.section_type || 'text',
          section.book || null,
          section.chapter || null,
          section.verse_start || null,
          section.verse_end || null
        );
      });
    }

    res.json({ message: 'Study guide updated successfully' });
  } catch (error) {
    console.error('Error updating study guide:', error);
    res.status(500).json({ error: 'Failed to update study guide' });
  }
});

app.delete('/api/study-guides/:id', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM study_guides WHERE id = ? AND user_id = ?');
    const result = stmt.run(req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Study guide not found' });
    }
    res.json({ message: 'Study guide deleted successfully' });
  } catch (error) {
    console.error('Error deleting study guide:', error);
    res.status(500).json({ error: 'Failed to delete study guide' });
  }
});

// Study Guide Sections routes
app.post('/api/study-guides/:guideId/sections', requireAuth, (req, res) => {
  try {
    const { title, content, order_index, section_type, book, chapter, verse_start, verse_end } = req.body;
    const stmt = db.prepare(`
      INSERT INTO study_guide_sections 
      (study_guide_id, title, content, order_index, section_type, book, chapter, verse_start, verse_end) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(req.params.guideId, title, content, order_index || 0, section_type || 'text', book, chapter, verse_start, verse_end);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Section created successfully' });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

app.put('/api/study-guide-sections/:id', requireAuth, (req, res) => {
  try {
    const { title, content, order_index } = req.body;
    const stmt = db.prepare('UPDATE study_guide_sections SET title = ?, content = ?, order_index = ? WHERE id = ?');
    const result = stmt.run(title, content, order_index, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json({ message: 'Section updated successfully' });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

app.delete('/api/study-guide-sections/:id', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM study_guide_sections WHERE id = ?');
    const result = stmt.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

// Word Studies routes
app.get('/api/word-studies', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM word_studies WHERE user_id = ? ORDER BY created_at DESC');
    const wordStudies = stmt.all(req.user.id);
    res.json(wordStudies);
  } catch (error) {
    console.error('Error fetching word studies:', error);
    res.status(500).json({ error: 'Failed to fetch word studies' });
  }
});

app.post('/api/word-studies', requireAuth, (req, res) => {
  try {
    const { strongs_number, title, notes } = req.body;
    const stmt = db.prepare('INSERT INTO word_studies (user_id, strongs_number, title, notes) VALUES (?, ?, ?, ?)');
    const result = stmt.run(req.user.id, strongs_number, title, notes);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Word study created successfully' });
  } catch (error) {
    console.error('Error creating word study:', error);
    res.status(500).json({ error: 'Failed to create word study' });
  }
});

app.put('/api/word-studies/:id', requireAuth, (req, res) => {
  try {
    const { title, notes } = req.body;
    const stmt = db.prepare('UPDATE word_studies SET title = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?');
    const result = stmt.run(title, notes, req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Word study not found' });
    }
    res.json({ message: 'Word study updated successfully' });
  } catch (error) {
    console.error('Error updating word study:', error);
    res.status(500).json({ error: 'Failed to update word study' });
  }
});

app.delete('/api/word-studies/:id', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM word_studies WHERE id = ? AND user_id = ?');
    const result = stmt.run(req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Word study not found' });
    }
    res.json({ message: 'Word study deleted successfully' });
  } catch (error) {
    console.error('Error deleting word study:', error);
    res.status(500).json({ error: 'Failed to delete word study' });
  }
});

// Lexicon routes
app.get('/api/lexicon/:strongs', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM greek_hebrew_lexicon WHERE strongs_number = ?');
    const entry = stmt.get(req.params.strongs);
    if (!entry) {
      return res.status(404).json({ error: 'Lexicon entry not found' });
    }
    res.json(entry);
  } catch (error) {
    console.error('Error fetching lexicon entry:', error);
    res.status(500).json({ error: 'Failed to fetch lexicon entry' });
  }
});

app.get('/api/lexicon', (req, res) => {
  try {
    const { search, language } = req.query;
    let query = 'SELECT * FROM greek_hebrew_lexicon WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (original_word LIKE ? OR transliteration LIKE ? OR definition LIKE ?)';

      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (language) {
      query += ' AND language = ?';
      params.push(language);
    }

    query += ' LIMIT 50';

    const stmt = db.prepare(query);
    const entries = stmt.all(...params);
    res.json(entries);
  } catch (error) {
    console.error('Error searching lexicon:', error);
    res.status(500).json({ error: 'Failed to search lexicon' });
  }
});

// Bible Data Routes

// Get available Bible versions
app.get('/api/bible/versions', async (req, res) => {
  try {
    const versions = await bibleLoader.getAvailableVersions();
    res.json(versions);
  } catch (error) {
    console.error('Error fetching Bible versions:', error);
    res.status(500).json({ error: 'Failed to fetch Bible versions' });
  }
});

// Get books for a version
app.get('/api/bible/:version/books', async (req, res) => {
  try {
    const { version } = req.params;
    const books = await bibleLoader.getBooks(version);
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get chapters for a book
app.get('/api/bible/:version/:book/chapters', async (req, res) => {
  try {
    const { version, book } = req.params;
    const chapterCount = await bibleLoader.getChapterCount(version, book);
    const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);
    res.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// Get chapter content
app.get('/api/bible/:version/:book/:chapter', async (req, res) => {
  try {
    const { version, book, chapter } = req.params;
    const chapterData = await bibleLoader.getChapter(version, book, chapter);
    res.json(chapterData);
  } catch (error) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

// Search Bible text
app.get('/api/bible/search', async (req, res) => {
  try {
    const { q: query, version = 'kjv' } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await bibleLoader.search(version, query);
    res.json({
      query,
      version,
      results
    });
  } catch (error) {
    console.error('Error searching Bible:', error);
    res.status(500).json({ error: 'Failed to search Bible' });
  }
});

// Get passage (verses)
app.get('/api/bible/:version/passage/:book/:chapter/:startVerse', async (req, res) => {
  try {
    const { version, book, chapter, startVerse } = req.params;
    const endVerse = req.query.endVerse || startVerse;
    const passageData = await bibleLoader.getPassage(version, book, chapter, startVerse, endVerse);
    res.json(passageData);
  } catch (error) {
    console.error('Error fetching passage:', error);
    res.status(500).json({ error: 'Failed to fetch passage' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Resources routes - serve PDF files
app.get('/test', (req, res) => {
  res.send('OK');
});

// Serve static files from the root directory
// app.use('/resources', express.static(path.resolve(__dirname, '..')));

// Serve PDF files individually
app.get('/resources/:filename', (req, res) => {
  const filename = req.params.filename;
  const allowedFiles = ['bsb_concordance.pdf', 'bib.pdf', 'bgb.pdf'];

  if (!allowedFiles.includes(filename)) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  const filePath = path.resolve(__dirname, '..', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(filePath);
});

// Serve Vue app for all other routes (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

console.log('About to start server...');
app.listen(PORT, () => {
  console.log(`Bible Study Hub API server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});
