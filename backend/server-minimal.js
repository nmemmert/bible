const express = require('express');
const cors = require('cors');
const BibleLoader = require('./bible-loader');

// Add process-level error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 5001;

let bibleLoader = null;
function getBibleLoader() {
  if (!bibleLoader) {
    console.log('Creating new BibleLoader instance');
    bibleLoader = new BibleLoader();
  }
  return bibleLoader;
}

// Middleware
app.use(cors());
app.use(express.json());

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Bible Data Routes
app.get('/api/bible/versions', (req, res) => {
  console.log('GET /api/bible/versions called at', new Date().toISOString());
  try {
    console.log('Creating BibleLoader...');
    const loader = getBibleLoader();
    console.log('BibleLoader created, calling getAvailableVersions...');
    const versions = loader.getAvailableVersions();
    console.log('getAvailableVersions returned:', versions.length, 'versions');
    console.log('Sending response...');
    res.json(versions);
    console.log('Response sent successfully');
  } catch (error) {
    console.error('Error in versions endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch Bible versions' });
  }
});

app.get('/api/bible/:version/books', async (req, res) => {
  try {
    const { version } = req.params;
    const books = await getBibleLoader().getBooks(version);
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

app.get('/api/bible/:version/:book/chapters', async (req, res) => {
  try {
    const { version, book } = req.params;
    const chapterCount = await getBibleLoader().getChapterCount(version, book);
    res.json({ chapterCount });
  } catch (error) {
    console.error('Error fetching chapter count:', error);
    res.status(500).json({ error: 'Failed to fetch chapter count' });
  }
});

app.get('/api/bible/:version/:book/:chapter', async (req, res) => {
  try {
    const { version, book, chapter } = req.params;
    const chapterData = await getBibleLoader().getChapter(version, book, chapter);
    res.json(chapterData);
  } catch (error) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

app.get('/api/bible/search', async (req, res) => {
  try {
    const { q: query, version = 'kjv' } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await getBibleLoader().search(version, query);
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Bible Study Hub API server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});