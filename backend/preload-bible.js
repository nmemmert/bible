const BibleLoader = require('./bible-loader');

async function preloadBibleData() {
  const loader = new BibleLoader();
  const versions = loader.getAvailableVersions();

  console.log(`Preloading ${versions.length} Bible versions...`);

  const bibleData = {};

  for (const version of versions) {
    console.log(`Loading ${version.id}...`);
    try {
      bibleData[version.id] = await loader.loadVersion(version.id);
      console.log(`Loaded ${version.id} with ${Object.keys(bibleData[version.id]).length} books`);
    } catch (error) {
      console.error(`Failed to load ${version.id}:`, error);
    }
  }

  return { versions, data: bibleData };
}

// Export for use in other scripts
if (require.main === module) {
  preloadBibleData().then(result => {
    console.log('Preloading complete');
    // Write to a file or export
    const fs = require('fs');
    fs.writeFileSync('./bible-data.json', JSON.stringify(result));
    console.log('Data written to bible-data.json');
  }).catch(error => {
    console.error('Preloading failed:', error);
    process.exit(1);
  });
}

module.exports = preloadBibleData;