const fs = require('fs');
const path = require('path');
const unbzip2 = require('unbzip2-stream');

/**
 * Bible data loader for compressed JSON Bible files
 */
class BibleLoader {
  constructor() {
    this.cache = new Map();
    this.basePath = path.join(__dirname, '..', 'bibles', 'json-bibles');
  }

  /**
   * Load a Bible version from compressed JSON
   * @param {string} version - The Bible version (e.g., 'kjv', 'esv')
   * @returns {Promise<Object>} The Bible data
   */
  async loadVersion(version) {
    if (this.cache.has(version)) {
      return this.cache.get(version);
    }

    const filePath = path.join(this.basePath, `${version}.json.pbz2`);

    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`Bible version '${version}' not found`);
      }

      console.log(`Loading ${version} from ${filePath}`);

      // Read the entire file synchronously
      const compressedData = fs.readFileSync(filePath);
      console.log(`Read ${compressedData.length} bytes`);

      // Decompress using unbzip2-stream
      const decompressedData = await new Promise((resolve, reject) => {
        const chunks = [];
        const stream = require('stream').Readable.from(compressedData).pipe(unbzip2());

        stream.on('data', chunk => {
          chunks.push(chunk);
        });

        stream.on('end', () => {
          resolve(Buffer.concat(chunks).toString('utf-8'));
        });

        stream.on('error', reject);
      });

      console.log(`Decompressed to ${decompressedData.length} characters`);

      const bibleData = JSON.parse(decompressedData);

      // Cache the data
      this.cache.set(version, bibleData);

      return bibleData;
    } catch (error) {
      console.error(`Error loading Bible version ${version}:`, error);
      throw error;
    }
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
    const verses = bibleData[book][chapter].map(verseString => {
      const match = verseString.match(/^(\d+)\s+(.+)$/);
      if (match) {
        return {
          verse: parseInt(match[1]),
          text: match[2]
        };
      }
      // Fallback for verses without numbers
      return {
        verse: 1,
        text: verseString
      };
    });

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
        verses.forEach(verseString => {
          // Parse verse string
          const match = verseString.match(/^(\d+)\s+(.+)$/);
          let verseNum, text;
          if (match) {
            verseNum = parseInt(match[1]);
            text = match[2];
          } else {
            verseNum = 1;
            text = verseString;
          }

          const lowerText = text.toLowerCase();
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
              text: text,
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
   * @returns {Array} List of available versions
   */
  getAvailableVersions() {
    const versions = [
      { id: 'kjv', name: 'King James Version', abbreviation: 'KJV' },
      { id: 'esv', name: 'English Standard Version', abbreviation: 'ESV' },
      { id: 'niv', name: 'New International Version', abbreviation: 'NIV' },
      { id: 'nkjv', name: 'New King James Version', abbreviation: 'NKJV' },
      { id: 'nlt', name: 'New Living Translation', abbreviation: 'NLT' },
      { id: 'amp', name: 'Amplified Bible', abbreviation: 'AMP' },
      { id: 'asv', name: 'American Standard Version', abbreviation: 'ASV' },
      { id: 'bbe', name: 'Bible in Basic English', abbreviation: 'BBE' },
      { id: 'bsb', name: 'Berean Study Bible', abbreviation: 'BSB' },
      { id: 'csb', name: 'Christian Standard Bible', abbreviation: 'CSB' },
      { id: 'darby', name: 'Darby Translation', abbreviation: 'DARBY' },
      { id: 'dra', name: 'Douay-Rheims American', abbreviation: 'DRA' },
      { id: 'ebr', name: 'Etheridge Translation', abbreviation: 'EBR' },
      { id: 'gnv', name: 'Geneva Bible', abbreviation: 'GNV' },
      { id: 'kjv1611', name: 'King James Version 1611', abbreviation: 'KJV1611' },
      { id: 'lsv', name: 'Literal Standard Version', abbreviation: 'LSV' },
      { id: 'msg', name: 'The Message', abbreviation: 'MSG' },
      { id: 'nasb1995', name: 'New American Standard Bible 1995', abbreviation: 'NASB1995' },
      { id: 'net', name: 'New English Translation', abbreviation: 'NET' },
      { id: 'niv1984', name: 'New International Version 1984', abbreviation: 'NIV1984' },
      { id: 'niv2011', name: 'New International Version 2011', abbreviation: 'NIV2011' },
      { id: 'rnkjv', name: 'Restored Name King James Version', abbreviation: 'RNKJV' },
      { id: 'rsv', name: 'Revised Standard Version', abbreviation: 'RSV' },
      { id: 'rv1960', name: 'Revised Version 1960', abbreviation: 'RV1960' },
      { id: 'rv2004', name: 'Revised Version 2004', abbreviation: 'RV2004' },
      { id: 'rwv', name: 'Revised Webster Version', abbreviation: 'RWV' },
      { id: 'ukjv', name: 'Updated King James Version', abbreviation: 'UKJV' },
      { id: 'ylt', name: 'Young\'s Literal Translation', abbreviation: 'YLT' }
    ];

    // Filter to only include versions that actually exist
    return versions.filter(version => {
      const filePath = path.join(this.basePath, `${version.id}.json.pbz2`);
      return fs.existsSync(filePath);
    });
  }
}

module.exports = BibleLoader;