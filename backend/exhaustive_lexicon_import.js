const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Connect to database
const dbPath = path.join(__dirname, 'bible_study.db');
const db = new Database(dbPath);

console.log('🌟 Starting Exhaustive Lexicon Import...');

// Comprehensive Strong's Greek Lexicon (sample of key entries - expand with full data)
const strongsGreekLexicon = [
    // Existing entries
    {
        strongs_number: 'G25',
        original_word: 'ἀγαπάω',
        transliteration: 'agapao',
        pronunciation: 'ag-ap-ah\'-o',
        part_of_speech: 'verb',
        definition: 'to love (in a social or moral sense)',
        usage: 'From agape; to love (in a social or moral sense): - (be-) love(-ed).',
        language: 'greek'
    },
    {
        strongs_number: 'G2316',
        original_word: 'θεός',
        transliteration: 'theos',
        pronunciation: 'theh\'-os',
        part_of_speech: 'noun',
        definition: 'a deity, especially the supreme Divinity; God',
        usage: 'Of uncertain affinity; a deity, especially (with ho) the supreme Divinity; figuratively, a magistrate; by Hebraism, very: - X exceeding, God, god(-ly, -ward).',
        language: 'greek'
    },
    {
        strongs_number: 'G3056',
        original_word: 'λόγος',
        transliteration: 'logos',
        pronunciation: 'log\'-os',
        part_of_speech: 'noun',
        definition: 'a word (as embodying an idea), a statement, a speech',
        usage: 'From lego; something said (including the thought); by implication, a topic (subject of discourse), also reasoning (the mental faculty) or motive; by extension, a computation; specially, (with the article in John) the Divine Expression (i.e. Christ): - account, cause, communication, X concerning, doctrine, fame, X have to do, intent, matter, mouth, preaching, question, reason, + reckon, remove, say(-ing), shew, X speaker, speech, talk, thing, + none of these things move me, tidings, treatise, utterance, word, work.',
        language: 'greek'
    },
    {
        strongs_number: 'G4151',
        original_word: 'πνεῦμα',
        transliteration: 'pneuma',
        pronunciation: 'pnyoo\'-mah',
        part_of_speech: 'noun',
        definition: 'a current of air, i.e. breath (blast) or a breeze; by analogy or figuratively, a spirit',
        usage: 'From pneo; a current of air, i.e. breath (blast) or a breeze; by analogy or figuratively, a spirit; by extension a rational soul: - ghost, life, spirit(-ual, -ually), mind.',
        language: 'greek'
    },
    {
        strongs_number: 'G4103',
        original_word: 'πιστός',
        transliteration: 'pistos',
        pronunciation: 'pis-tos\'',
        part_of_speech: 'adjective',
        definition: 'objectively, trustworthy; subjectively, trustful',
        usage: 'From peitho; objectively, trustworthy; subjectively, trustful: - believe(-ing, -r), faithful(-ly), sure, true.',
        language: 'greek'
    },
    // Add more comprehensive entries here
    // You can expand this with full Strong's data
    {
        strongs_number: 'G1',
        original_word: 'Α',
        transliteration: 'A',
        pronunciation: 'al\'-fah',
        part_of_speech: 'noun',
        definition: 'the first letter of the alphabet; figuratively, only (from its use as a numeral) first',
        usage: 'Of Hebrew origin; the first letter of the alphabet; figuratively, only (from its use as a numeral) first: - Alpha.',
        language: 'greek'
    },
    {
        strongs_number: 'G2',
        original_word: 'Ἀαρών',
        transliteration: 'Aaron',
        pronunciation: 'ah-ar-ohn\'',
        part_of_speech: 'proper noun',
        definition: 'Aaron, the brother of Moses',
        usage: 'Of Hebrew origin [Aharon]; Aaron, the brother of Moses: - Aaron.',
        language: 'greek'
    },
    {
        strongs_number: 'G3',
        original_word: 'ἀββα',
        transliteration: 'abba',
        pronunciation: 'ab-bah\'',
        part_of_speech: 'noun',
        definition: 'father (as a vocative case)',
        usage: 'Of Chaldee origin [ab]; father (as a vocative case): - Abba.',
        language: 'greek'
    },
    {
        strongs_number: 'G4',
        original_word: 'ἀβατός',
        transliteration: 'abatōs',
        pronunciation: 'ab-at\'-os',
        part_of_speech: 'adjective',
        definition: 'not to be trodden, i.e. impassable',
        usage: 'From a (as a negative particle) and a derivative of baino; not to be trodden, i.e. impassable: - that cannot be trodden.',
        language: 'greek'
    },
    {
        strongs_number: 'G5',
        original_word: 'Ἀββᾶ',
        transliteration: 'Abba',
        pronunciation: 'ab-bah\'',
        part_of_speech: 'proper noun',
        definition: 'Abba, Father',
        usage: 'Of Chaldee origin [ab]; father (as a vocative): - Abba.',
        language: 'greek'
    }
];

// Comprehensive Strong's Hebrew Lexicon (sample - expand with full data)
const strongsHebrewLexicon = [
    // Existing entries
    {
        strongs_number: 'H3068',
        original_word: 'יְהֹוָה',
        transliteration: 'Yehovah',
        pronunciation: 'yeh-ho-vaw\'',
        part_of_speech: 'proper noun',
        definition: 'the proper name of the God of Israel',
        usage: 'From hayah; (the) self-Existent or Eternal; Jehovah, Jewish national name of God: - Jehovah, the Lord.',
        language: 'hebrew'
    },
    {
        strongs_number: 'H430',
        original_word: 'אֱלֹהִים',
        transliteration: 'elohim',
        pronunciation: 'el-o-heem\'',
        part_of_speech: 'noun',
        definition: 'gods in the ordinary sense; but specifically used (in the plural thus, especially with the article) of the supreme God',
        usage: 'Plural of \'elowahh; gods in the ordinary sense; but specifically used (in the plural thus, especially with the article) of the supreme God; occasionally applied by way of deference to magistrates; and sometimes as a superlative: - angels, X exceeding, God (gods)(-dess, -ly), X (very) great, judges, X mighty.',
        language: 'hebrew'
    },
    {
        strongs_number: 'H2617',
        original_word: 'חֶסֶד',
        transliteration: 'checed',
        pronunciation: 'kheh\'-sed',
        part_of_speech: 'noun',
        definition: 'kindness; by implication (towards God) piety; rarely (by opposition) reproof, or (subject) beauty',
        usage: 'From chacad; kindness; by implication (towards God) piety: rarely (by opposition) reproof, or (subject.) beauty; - favour, good deed(-liness, -ness), kindly, (loving-)kindness, merciful (kindness), mercy, pity, reproach, wicked thing.',
        language: 'hebrew'
    },
    // Add more comprehensive entries here
    {
        strongs_number: 'H1',
        original_word: 'אָב',
        transliteration: 'ab',
        pronunciation: 'awb',
        part_of_speech: 'noun',
        definition: 'father, in a literal and immediate, or figurative and remote application',
        usage: 'A primitive word; father, in a literal and immediate, or figurative and remote application): - chief, (fore-)father(-less), X patrimony, principal.',
        language: 'hebrew'
    },
    {
        strongs_number: 'H2',
        original_word: 'אַב',
        transliteration: 'ab',
        pronunciation: 'ab',
        part_of_speech: 'noun',
        definition: 'father, in a literal and immediate, or figurative and remote application',
        usage: 'A primitive word; father, in a literal and immediate, or figurative and remote application): - chief, (fore-)father(-less), X patrimony, principal.',
        language: 'hebrew'
    },
    {
        strongs_number: 'H3',
        original_word: 'אֵב',
        transliteration: 'eb',
        pronunciation: 'abe',
        part_of_speech: 'noun',
        definition: 'a green plant',
        usage: 'From the same as \'ab; a green plant: - greenness, fruit.',
        language: 'hebrew'
    },
    {
        strongs_number: 'H4',
        original_word: 'אֵב',
        transliteration: 'eb',
        pronunciation: 'abe',
        part_of_speech: 'noun',
        definition: 'fruit (in a wide sense)',
        usage: 'From the same as \'ab; fruit (in a wide sense): - fruit.',
        language: 'hebrew'
    },
    {
        strongs_number: 'H5',
        original_word: 'אֲבַגְתָא',
        transliteration: 'Abagtha',
        pronunciation: 'ab-ag-thaw\'',
        part_of_speech: 'proper noun',
        definition: 'Abagtha, one of the seven eunuchs of Ahasuerus',
        usage: 'Of foreign origin; Abagtha, one of the seven eunuchs of Ahasuerus: - Abagtha.',
        language: 'hebrew'
    }
];

// Function to import lexicon data
async function importLexiconData(entries, language) {
    console.log(`📚 Importing ${entries.length} ${language} lexicon entries...`);

    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO greek_hebrew_lexicon
        (strongs_number, original_word, transliteration, pronunciation, part_of_speech, definition, usage, language)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let successCount = 0;
    let errorCount = 0;

    for (const entry of entries) {
        try {
            insertStmt.run(
                entry.strongs_number,
                entry.original_word,
                entry.transliteration || '',
                entry.pronunciation || '',
                entry.part_of_speech || '',
                entry.definition,
                entry.usage || '',
                entry.language
            );
            successCount++;
        } catch (error) {
            console.error(`❌ Error importing ${entry.strongs_number}:`, error.message);
            errorCount++;
        }
    }

    console.log(`✅ Successfully imported ${successCount} ${language} entries`);
    if (errorCount > 0) {
        console.log(`⚠️  ${errorCount} entries had errors`);
    }

    return { successCount, errorCount };
}

// Function to import from external JSON file
async function importFromFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return { successCount: 0, errorCount: 0 };
        }

        console.log(`📂 Importing from file: ${filePath}`);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (Array.isArray(data)) {
            return await importLexiconData(data, 'unknown');
        } else if (data.greek && Array.isArray(data.greek)) {
            const greekResult = await importLexiconData(data.greek, 'greek');
            const hebrewResult = data.hebrew && Array.isArray(data.hebrew)
                ? await importLexiconData(data.hebrew, 'hebrew')
                : { successCount: 0, errorCount: 0 };

            return {
                successCount: greekResult.successCount + hebrewResult.successCount,
                errorCount: greekResult.errorCount + hebrewResult.errorCount
            };
        }
    } catch (error) {
        console.error(`❌ Error importing from file ${filePath}:`, error.message);
        return { successCount: 0, errorCount: 1 };
    }
}

async function main() {
    try {
        // Check current count
        const initialCount = db.prepare('SELECT COUNT(*) as count FROM greek_hebrew_lexicon').get();
        console.log(`📊 Initial lexicon count: ${initialCount.count} entries`);

        let totalSuccess = 0;
        let totalErrors = 0;

        // Import built-in Greek lexicon
        const greekResult = await importLexiconData(strongsGreekLexicon, 'Greek');
        totalSuccess += greekResult.successCount;
        totalErrors += greekResult.errorCount;

        // Import built-in Hebrew lexicon
        const hebrewResult = await importLexiconData(strongsHebrewLexicon, 'Hebrew');
        totalSuccess += hebrewResult.successCount;
        totalErrors += hebrewResult.errorCount;

        // Try to import from external files if they exist
        const possibleFiles = [
            path.join(__dirname, 'strongs-greek.json'),
            path.join(__dirname, 'strongs-hebrew.json'),
            path.join(__dirname, 'strongs-complete.json'),
            path.join(__dirname, 'lexicon-data.json')
        ];

        for (const file of possibleFiles) {
            const fileResult = await importFromFile(file);
            totalSuccess += fileResult.successCount;
            totalErrors += fileResult.errorCount;
        }

        // Final count
        const finalCount = db.prepare('SELECT COUNT(*) as count FROM greek_hebrew_lexicon').get();
        console.log(`\n🎉 Lexicon import complete!`);
        console.log(`📊 Final count: ${finalCount.count} entries`);
        console.log(`✅ Successfully added: ${totalSuccess} entries`);
        if (totalErrors > 0) {
            console.log(`⚠️  Errors encountered: ${totalErrors}`);
        }

        // Show breakdown by language
        const languageBreakdown = db.prepare(`
            SELECT language, COUNT(*) as count
            FROM greek_hebrew_lexicon
            GROUP BY language
            ORDER BY count DESC
        `).all();

        console.log(`\n📈 Language breakdown:`);
        languageBreakdown.forEach(row => {
            console.log(`   ${row.language}: ${row.count} entries`);
        });

    } catch (error) {
        console.error('❌ Fatal error during lexicon import:', error);
    } finally {
        db.close();
    }
}

// Run the import
main().catch(console.error);