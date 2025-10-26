const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🔄 Converting OpenScriptures Strong\'s data to JSON format...');

// Function to convert OpenScriptures format to our format
function convertDictionary(jsFilePath, language) {
    console.log(`📖 Processing ${language} dictionary: ${jsFilePath}`);

    // Read the JavaScript file
    const jsContent = fs.readFileSync(jsFilePath, 'utf8');

    // Remove module.exports line if it exists
    const cleanJsContent = jsContent.replace(/module\.exports\s*=.*;/g, '');

    // Create a sandbox to safely execute the JavaScript
    const sandbox = {};
    vm.createContext(sandbox);

    try {
        // Execute the JavaScript in the sandbox
        vm.runInContext(cleanJsContent, sandbox);

        // Extract the dictionary object
        const dictName = language === 'greek' ? 'strongsGreekDictionary' : 'strongsHebrewDictionary';
        const dictionary = sandbox[dictName];

        if (!dictionary) {
            throw new Error(`Could not find ${dictName} in the JavaScript file`);
        }

        // Convert to our format
        const entries = [];
        for (const [strongsNumber, data] of Object.entries(dictionary)) {
            const entry = {
                strongs_number: strongsNumber,
                original_word: data.lemma || '',
                transliteration: data.translit || data.xlit || '',
                pronunciation: data.pron || '',
                part_of_speech: '',  // Not always available in this dataset
                definition: data.strongs_def || data.kjv_def || '',
                usage: data.derivation || '',
                language: language
            };
            entries.push(entry);
        }

        console.log(`✅ Converted ${entries.length} ${language} entries`);
        return entries;

    } catch (error) {
        console.error(`❌ Error processing ${language} dictionary:`, error.message);
        throw error;
    }
}

// Convert both dictionaries
const greekEntries = convertDictionary(
    path.join(__dirname, '..', 'strongs-data', 'greek', 'strongs-greek-dictionary.js'),
    'greek'
);

const hebrewEntries = convertDictionary(
    path.join(__dirname, '..', 'strongs-data', 'hebrew', 'strongs-hebrew-dictionary.js'),
    'hebrew'
);

// Create the final JSON structure
const completeData = {
    greek: greekEntries,
    hebrew: hebrewEntries
};

// Write to file
const outputPath = path.join(__dirname, 'backend', 'strongs-complete.json');
fs.writeFileSync(outputPath, JSON.stringify(completeData, null, 2));

console.log(`\n🎉 Conversion complete!`);
console.log(`📊 Total entries: ${greekEntries.length + hebrewEntries.length}`);
console.log(`   Greek: ${greekEntries.length} entries`);
console.log(`   Hebrew: ${hebrewEntries.length} entries`);
console.log(`💾 Saved to: ${outputPath}`);

console.log(`\n🚀 Next steps:`);
console.log(`1. cd bible/backend`);
console.log(`2. node exhaustive_lexicon_import.js`);
console.log(`3. Your lexicon will now have comprehensive Strong's data!`);