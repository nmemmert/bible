const BibleLoader = require('./bible-loader');

async function testBibleLoader() {
  try {
    console.log('Creating BibleLoader...');
    const loader = new BibleLoader();

    console.log('Getting available versions...');
    const versions = loader.getAvailableVersions();
    console.log('Available versions:', versions.length);

    if (versions.length > 0) {
      console.log('Testing loadVersion for:', versions[0].id);
      const data = await loader.loadVersion(versions[0].id);
      console.log('Successfully loaded version, data keys:', Object.keys(data));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testBibleLoader();