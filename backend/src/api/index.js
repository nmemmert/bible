import axios from 'axios'

// Load Bible data
let bibleData = null;
let bibleVersions = null;

const loadBibleData = async () => {
  if (!bibleData) {
    try {
      const response = await fetch('/bible-data.json');
      const data = await response.json();
      bibleData = data.data;
      bibleVersions = data.versions;
    } catch (error) {
      console.error('Failed to load Bible data:', error);
      // Fallback to empty data
      bibleData = {};
      bibleVersions = [];
    }
  }
  return { data: bibleData, versions: bibleVersions };
};

const api = {
  post: axios.post,
  get: axios.get,
  put: axios.put,
  delete: axios.delete,

  async getVersions() {
    const { versions } = await loadBibleData();
    return { data: versions };
  },

  async getBooks(version) {
    const { data } = await loadBibleData();
    if (data[version]) {
      return { data: Object.keys(data[version]) };
    }
    throw new Error(`Version ${version} not found`);
  },

  async getChapter(version, book, chapter) {
    const { data } = await loadBibleData();
    if (data[version] && data[version][book] && data[version][book][chapter]) {
      const verses = data[version][book][chapter].map(verseString => {
        const match = verseString.match(/^(\d+)\s+(.+)$/);
        if (match) {
          return {
            verse: parseInt(match[1]),
            text: match[2]
          };
        }
        return {
          verse: 1,
          text: verseString
        };
      });

      return {
        data: {
          version,
          book,
          chapter: parseInt(chapter),
          verses
        }
      };
    }
    throw new Error(`Chapter ${book} ${chapter} not found in ${version}`);
  },

  async search(version, query) {
    const { data } = await loadBibleData();
    if (!data[version]) {
      throw new Error(`Version ${version} not found`);
    }

    const results = [];
    const bible = data[version];

    for (const bookName of Object.keys(bible)) {
      for (const chapterNum of Object.keys(bible[bookName])) {
        const chapter = bible[bookName][chapterNum];
        chapter.forEach((verseText, verseIndex) => {
          if (verseText.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              book: bookName,
              chapter: parseInt(chapterNum),
              verse: verseIndex + 1,
              text: verseText,
              reference: `${bookName} ${chapterNum}:${verseIndex + 1}`
            });
          }
        });
      }
    }

    return {
      data: {
        query,
        version,
        results: results.slice(0, 100) // Limit results
      }
    };
  }
};

export default api