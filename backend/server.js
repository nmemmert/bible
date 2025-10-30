const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

console.log('Modules loaded');

const app = express();
const PORT = process.env.PORT || 8086;

console.log('App created, PORT:', PORT);

// Global error handler - log but don't exit
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  // Don't exit - let the server continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - let the server continue
});

// Handle process exit
process.on('exit', (code) => {
  console.log('Process exiting with code:', code);
});

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory user store (in production, use a database)
let users = [
  { id: 1, username: 'demo', password: 'demo123', email: 'demo@example.com' }
];

let sessions = new Map(); // Simple session store

// Simple in-memory stores for highlights and bookmarks
let highlights = [];
let bookmarks = [];
let notes = [];

// Authentication middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7);
  if (!sessions.has(token)) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  req.user = sessions.get(token);
  next();
}

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Create session token
  const token = Math.random().toString(36).substring(2);
  const sessionData = { 
    id: user.id, 
    username: user.username, 
    email: user.email 
  };
  sessions.set(token, sessionData);
  
  res.json({ 
    token, 
    user: sessionData,
    message: 'Login successful' 
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    sessions.delete(token);
  }
  res.json({ message: 'Logged out successfully' });
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  
  // Check if username already exists
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  
  // Check if email already exists
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }
  
  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password // In production, hash this password
  };
  
  users.push(newUser);
  
  res.status(201).json({ 
    message: 'User registered successfully',
    user: { id: newUser.id, username: newUser.username, email: newUser.email }
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// PDF Resources API
app.get('/api/resources', requireAuth, (req, res) => {
  try {
    const resourcesPath = path.join(__dirname, '..', 'pdf_resources.json');
    const resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'));
    
    // Add extracted text content to each resource
    const resourcesWithText = resources.map(resource => {
      const textFilePath = path.join(__dirname, `${resource.filename}.txt`);
      let extractedText = '';
      
      try {
        if (fs.existsSync(textFilePath)) {
          extractedText = fs.readFileSync(textFilePath, 'utf8');
        }
      } catch (error) {
        console.warn(`Could not read text file for ${resource.filename}:`, error.message);
      }
      
      return {
        ...resource,
        extractedText,
        content: extractedText // Also set content for backward compatibility
      };
    });
    
    res.json(resourcesWithText);
  } catch (error) {
    console.error('Error reading resources:', error);
    res.status(500).json({ error: 'Failed to load resources' });
  }
});

// Lexicon routes
app.get('/api/lexicon/:strongs', (req, res) => {
  try {
    const lexiconData = require('./strongs-complete.json');
    const strongsNumber = req.params.strongs.toUpperCase();

    // Search in Greek and Hebrew
    let result = null;
    if (lexiconData.greek) {
      result = lexiconData.greek.find(entry => entry.strongs_number === strongsNumber);
    }
    if (!result && lexiconData.hebrew) {
      result = lexiconData.hebrew.find(entry => entry.strongs_number === strongsNumber);
    }

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Lexicon entry not found' });
    }
  } catch (error) {
    console.error('Error fetching lexicon entry:', error);
    res.status(500).json({ error: 'Failed to fetch lexicon entry' });
  }
});

app.get('/api/lexicon', (req, res) => {
  console.log('Lexicon API called with query:', req.query);
  try {
    const { search, language, page = 1, limit = 100 } = req.query;
    const lexiconData = require('./strongs-complete.json');

    let allEntries = [];
    if (!language || language === 'greek') {
      allEntries = allEntries.concat(lexiconData.greek || []);
    }
    if (!language || language === 'hebrew') {
      allEntries = allEntries.concat(lexiconData.hebrew || []);
    }

    console.log(`Loaded ${allEntries.length} total entries`);
    let filteredEntries = allEntries;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredEntries = allEntries.filter(entry =>
        (entry.original_word && entry.original_word.toLowerCase().includes(searchLower)) ||
        (entry.transliteration && entry.transliteration.toLowerCase().includes(searchLower)) ||
        (entry.definition && entry.definition.toLowerCase().includes(searchLower))
      );
    }

    // Implement pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    console.log(`Returning ${paginatedEntries.length} lexicon entries (page ${pageNum}, limit ${limitNum})`);
    res.json({
      entries: paginatedEntries,
      total: filteredEntries.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filteredEntries.length / limitNum)
    });
  } catch (error) {
    console.error('Error searching lexicon:', error);
    res.status(500).json({ error: 'Failed to search lexicon' });
  }
});

// Bible search API
app.get('/api/bible/search', async (req, res) => {
  try {
    const { q: query, version = 'kjv' } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const BibleLoader = require('./bible-loader');
    const loader = new BibleLoader();
    const results = await loader.search(version, query);
    res.json(results);
  } catch (error) {
    console.error('Error searching Bible:', error);
    res.status(500).json({ error: 'Failed to search Bible' });
  }
});

// Bible chapter API
app.get('/api/bible/:version/:book/:chapter', async (req, res) => {
  try {
    const { version, book, chapter } = req.params;
    const chapterNum = parseInt(chapter);

    const BibleLoader = require('./bible-loader');
    const loader = new BibleLoader();
    const chapterData = await loader.getChapter(version, book, chapterNum);

    if (chapterData) {
      res.json(chapterData);
    } else {
      res.status(404).json({ error: 'Chapter not found' });
    }
  } catch (error) {
    console.error('Error loading chapter:', error);
    res.status(500).json({ error: 'Failed to load chapter' });
  }
});

// Word Studies API
let wordStudies = [
  {
    id: 1,
    strongs_number: 'G25',
    title: 'Love Study',
    notes: 'Personal study on the Greek word for love (agape)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    strongs_number: 'H3068',
    title: 'YHWH Study',
    notes: 'Study of the divine name and its significance',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

app.get('/api/word-studies', requireAuth, (req, res) => {
  res.json(wordStudies);
});

app.post('/api/word-studies', requireAuth, (req, res) => {
  const newStudy = {
    id: wordStudies.length + 1,
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  wordStudies.push(newStudy);
  res.json(newStudy);
});

app.put('/api/word-studies/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const studyIndex = wordStudies.findIndex(study => study.id === id);
  if (studyIndex === -1) {
    return res.status(404).json({ error: 'Word study not found' });
  }
  wordStudies[studyIndex] = {
    ...wordStudies[studyIndex],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  res.json(wordStudies[studyIndex]);
});

app.delete('/api/word-studies/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const studyIndex = wordStudies.findIndex(study => study.id === id);
  if (studyIndex === -1) {
    return res.status(404).json({ error: 'Word study not found' });
  }
  wordStudies.splice(studyIndex, 1);
  res.json({ success: true });
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('Health endpoint called');
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Highlights API
app.post('/api/highlights', requireAuth, (req, res) => {
  const { book, chapter, verse, color, text, startOffset, endOffset } = req.body;
  const userId = req.user.id;

  const highlight = {
    id: highlights.length + 1,
    userId,
    book,
    chapter,
    verse,
    color: color || 'yellow',
    text, // Selected text (optional for backward compatibility)
    startOffset, // Start position in verse text (optional)
    endOffset, // End position in verse text (optional)
    createdAt: new Date().toISOString()
  };

  highlights.push(highlight);
  res.status(201).json(highlight);
});

app.get('/api/highlights', requireAuth, (req, res) => {
  const userId = req.user.id;
  const userHighlights = highlights.filter(h => h.userId === userId);
  res.json(userHighlights);
});

app.delete('/api/highlights/:id', requireAuth, (req, res) => {
  const userId = req.user.id;
  const highlightId = parseInt(req.params.id);

  const index = highlights.findIndex(h => h.id === highlightId && h.userId === userId);
  if (index === -1) {
    return res.status(404).json({ error: 'Highlight not found' });
  }

  highlights.splice(index, 1);
  res.json({ message: 'Highlight deleted successfully' });
});

// Bookmarks API
app.post('/api/bookmarks', requireAuth, (req, res) => {
  const { book, chapter, verse, title } = req.body;
  const userId = req.user.id;

  const bookmark = {
    id: bookmarks.length + 1,
    userId,
    book,
    chapter,
    verse,
    title: title || '',
    createdAt: new Date().toISOString()
  };

  bookmarks.push(bookmark);
  res.status(201).json(bookmark);
});

app.get('/api/bookmarks', requireAuth, (req, res) => {
  const userId = req.user.id;
  const userBookmarks = bookmarks.filter(b => b.userId === userId);
  res.json(userBookmarks);
});

app.delete('/api/bookmarks/:id', requireAuth, (req, res) => {
  const userId = req.user.id;
  const bookmarkId = parseInt(req.params.id);

  const index = bookmarks.findIndex(b => b.id === bookmarkId && b.userId === userId);
  if (index === -1) {
    return res.status(404).json({ error: 'Bookmark not found' });
  }

  bookmarks.splice(index, 1);
  res.json({ message: 'Bookmark deleted successfully' });
});

// Notes API
app.post('/api/notes', requireAuth, (req, res) => {
  const { book, chapter, verse, content } = req.body;
  const userId = req.user.id;

  const note = {
    id: notes.length + 1,
    userId,
    book,
    chapter,
    verse,
    content,
    createdAt: new Date().toISOString()
  };

  notes.push(note);
  res.status(201).json(note);
});

app.get('/api/notes', requireAuth, (req, res) => {
  const userId = req.user.id;
  const userNotes = notes.filter(n => n.userId === userId);
  res.json(userNotes);
});

app.delete('/api/notes/:id', requireAuth, (req, res) => {
  const userId = req.user.id;
  const noteId = parseInt(req.params.id);

  const index = notes.findIndex(n => n.id === noteId && n.userId === userId);
  if (index === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }

  notes.splice(index, 1);
  res.json({ message: 'Note deleted successfully' });
});

// 404 handler for API routes - temporarily commented out
/*
app.use((req, res) => {
  console.log('404 for:', req.url);
  res.status(404).json({ error: 'Route not found' });
});
*/

// Serve static files from the public directory (built frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all handler: send back index.html for any non-API routes
app.use((req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api/')) {
    try {
      const filePath = path.join(__dirname, 'public', 'index.html');
      console.log('Serving file:', filePath, 'for request:', req.url);
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending index.html:', err);
          res.status(500).send('Error loading page');
        }
      });
    } catch (error) {
      console.error('Exception in catch-all handler:', error);
      res.status(500).send('Server error');
    }
  } else {
    // For API routes that don't exist, return 404
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

console.log('PORT:', PORT);
console.log('Starting lexicon test server...');
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Lexicon test server running on port ${PORT}`);
  console.log('Server address:', server.address());
  console.log('Server started successfully - ready to accept connections');
}).on('error', (err) => {
  console.error('Server startup error:', err);
  process.exit(1);
}).on('listening', () => {
  console.log('Server is now listening');
  console.log('Server should be accessible at http://localhost:' + PORT);
}).on('connection', (socket) => {
  console.log('New connection from:', socket.remoteAddress);
});