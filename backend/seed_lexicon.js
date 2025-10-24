const Database = require('better-sqlite3');
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'bible_study.db');
const db = new Database(dbPath);

console.log('Seeding Greek/Hebrew lexicon...');

// Basic Greek words (sample - can be expanded)
const greekWords = [
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
    }
];

// Basic Hebrew words (sample)
const hebrewWords = [
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
    }
];

try {
    // Check if lexicon is already seeded
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM greek_hebrew_lexicon').get();
    if (existingCount.count > 0) {
        console.log('Lexicon already seeded with', existingCount.count, 'entries');
        db.close();
        return;
    }

    // Insert Greek words
    const insertStmt = db.prepare(`
        INSERT INTO greek_hebrew_lexicon
        (strongs_number, original_word, transliteration, pronunciation, part_of_speech, definition, usage, language)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    console.log('Inserting Greek words...');
    for (const word of greekWords) {
        insertStmt.run(
            word.strongs_number,
            word.original_word,
            word.transliteration,
            word.pronunciation,
            word.part_of_speech,
            word.definition,
            word.usage,
            word.language
        );
    }

    console.log('Inserting Hebrew words...');
    for (const word of hebrewWords) {
        insertStmt.run(
            word.strongs_number,
            word.original_word,
            word.transliteration,
            word.pronunciation,
            word.part_of_speech,
            word.definition,
            word.usage,
            word.language
        );
    }

    const finalCount = db.prepare('SELECT COUNT(*) as count FROM greek_hebrew_lexicon').get();
    console.log('✅ Lexicon seeded successfully with', finalCount.count, 'entries');

} catch (error) {
    console.error('❌ Error seeding lexicon:', error);
} finally {
    db.close();
}