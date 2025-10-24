const fs = require('fs');
const path = require('path');

/**
 * Bible data loader for embedded JSON Bible data
 */
class BibleLoader {
  constructor() {
    this.cache = new Map();
    this.embeddedDataPath = path.join(__dirname, 'bible-data.json');
    this.embeddedData = null;
  }

  /**
   * Load the embedded Bible data
   * @returns {Promise<Object>} The embedded Bible data
   */
  async loadEmbeddedData() {
    if (this.embeddedData) {
      return this.embeddedData;
    }

    try {
      console.log(`Loading embedded Bible data from ${this.embeddedDataPath}`);
      const data = fs.readFileSync(this.embeddedDataPath, 'utf-8');
      this.embeddedData = JSON.parse(data);
      console.log(`Loaded embedded Bible data with ${Object.keys(this.embeddedData.data).length} books`);
      return this.embeddedData;
    } catch (error) {
      console.error('Error loading embedded Bible data:', error);
      throw error;
    }
  }

  /**
   * Load a Bible version from embedded data
   * @param {string} version - The Bible version (e.g., 'kjv', 'esv')
   * @returns {Promise<Object>} The Bible data for the version
   */
  async loadVersion(version) {
    if (this.cache.has(version)) {
      return this.cache.get(version);
    }

    const embeddedData = await this.loadEmbeddedData();

    // Check if version exists in the data
    if (!embeddedData.data[version]) {
      throw new Error(`Bible version '${version}' not found in embedded data`);
    }

    console.log(`Loading ${version} from embedded data`);

    // Return the version-specific data
    const bibleData = embeddedData.data[version];

    // Cache the data
    this.cache.set(version, bibleData);

    return bibleData;
  }

  /**
   * Get a specific chapter from a Bible version
   * @param {string} version - The Bible version
   * @param {string} book - The book name
   * @param {number} chapter - The chapter number
   * @returns {Promise<Object>} The chapter data
   */
  async getChapter(version, book, chapter) {
    const bibleData = await this.loadVersion(version);

    if (!bibleData[book] || !bibleData[book][chapter]) {
      throw new Error(`Chapter ${book} ${chapter} not found in ${version}`);
    }

    // Parse verse strings into objects with verse number and text
    // The embedded data has verses as plain text, so we assign sequential verse numbers
    const verses = bibleData[book][chapter].map((verseText, index) => ({
      verse: index + 1,
      text: verseText
    }));

    return {
      version,
      book,
      chapter: parseInt(chapter),
      verses
    };
  }

  /**
   * Get a specific passage (range of verses)
   * @param {string} version - The Bible version
   * @param {string} book - The book name
   * @param {number} chapter - The chapter number
   * @param {number} startVerse - Starting verse number
   * @param {number} endVerse - Ending verse number (optional)
   * @returns {Promise<Object>} The passage data
   */
  async getPassage(version, book, chapter, startVerse, endVerse = null) {
    const chapterData = await this.getChapter(version, book, chapter);

    const end = endVerse || startVerse;
    const verses = chapterData.verses.filter(verse =>
      verse.verse >= startVerse && verse.verse <= end
    );

    return {
      version,
      book,
      chapter: parseInt(chapter),
      startVerse: parseInt(startVerse),
      endVerse: parseInt(end),
      verses
    };
  }

  /**
   * Search for text in a Bible version
   * @param {string} version - The Bible version
   * @param {string} query - The search query
   * @returns {Promise<Array>} Search results
   */
  async search(version, query) {
    const bibleData = await this.loadVersion(version);
    const results = [];
    const searchTerm = query.toLowerCase();

    for (const [bookName, chapters] of Object.entries(bibleData)) {
      for (const [chapterNum, verses] of Object.entries(chapters)) {
        verses.forEach((verseText, verseIndex) => {
          const verseNum = verseIndex + 1;
          const lowerText = verseText.toLowerCase();
          if (lowerText.includes(searchTerm)) {
            // Find highlight positions
            const highlights = [];
            let startIndex = 0;
            let index;

            while ((index = lowerText.indexOf(searchTerm, startIndex)) !== -1) {
              highlights.push({
                start: index,
                end: index + searchTerm.length
              });
              startIndex = index + 1;
            }

            results.push({
              book: bookName,
              chapter: parseInt(chapterNum),
              verse: verseNum,
              text: verseText,
              highlights
            });
          }
        });
      }
    }

    return results.slice(0, 100); // Limit results
  }

  /**
   * Get available books for a version
   * @param {string} version - The Bible version
   * @returns {Promise<Array>} List of book names
   */
  async getBooks(version) {
    const bibleData = await this.loadVersion(version);
    return Object.keys(bibleData);
  }

  /**
   * Get chapter count for a book
   * @param {string} version - The Bible version
   * @param {string} book - The book name
   * @returns {Promise<number>} Number of chapters
   */
  async getChapterCount(version, book) {
    const bibleData = await this.loadVersion(version);
    if (!bibleData[book]) {
      throw new Error(`Book '${book}' not found in ${version}`);
    }
    return Object.keys(bibleData[book]).length;
  }

  /**
   * Get available Bible versions
   * @returns {Promise<Array>} List of available versions
   */
  async getAvailableVersions() {
    const embeddedData = await this.loadEmbeddedData();
    return embeddedData.versions;
  }
}

module.exports = BibleLoader;