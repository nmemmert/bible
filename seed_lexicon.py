"""
Seed script to populate the Greek/Hebrew lexicon with basic Strong's data
"""
import json
from models import db, GreekHebrewLexicon

def seed_basic_lexicon(app):
    """Seed the database with basic Greek and Hebrew lexicon entries"""
    with app.app_context():
        # Check if lexicon is already seeded
        if GreekHebrewLexicon.query.first():
            print("Lexicon already seeded")
            return
        
        # Basic Greek words (sample)
        greek_words = [
            {
                'strongs_number': 'G25',
                'original_word': 'ἀγαπάω',
                'transliteration': 'agapao',
                'pronunciation': 'ag-ap-ah\'-o',
                'part_of_speech': 'verb',
                'definition': 'to love (in a social or moral sense)',
                'usage': 'From agape; to love (in a social or moral sense): - (be-) love(-ed).',
                'language': 'greek'
            },
            {
                'strongs_number': 'G2316',
                'original_word': 'θεός',
                'transliteration': 'theos',
                'pronunciation': 'theh\'-os',
                'part_of_speech': 'noun',
                'definition': 'a deity, especially the supreme Divinity; God',
                'usage': 'Of uncertain affinity; a deity, especially (with ho) the supreme Divinity; figuratively, a magistrate; by Hebraism, very: - X exceeding, God, god(-ly, -ward).',
                'language': 'greek'
            },
            {
                'strongs_number': 'G3056',
                'original_word': 'λόγος',
                'transliteration': 'logos',
                'pronunciation': 'log\'-os',
                'part_of_speech': 'noun',
                'definition': 'a word (as embodying an idea), a statement, a speech',
                'usage': 'From lego; something said (including the thought); by implication, a topic (subject of discourse), also reasoning (the mental faculty) or motive; by extension, a computation; specially, (with the article in John) the Divine Expression (i.e. Christ): - account, cause, communication, X concerning, doctrine, fame, X have to do, intent, matter, mouth, preaching, question, reason, + reckon, remove, say(-ing), shew, X speaker, speech, talk, thing, + none of these things move me, tidings, treatise, utterance, word, work.',
                'language': 'greek'
            },
            {
                'strongs_number': 'G4151',
                'original_word': 'πνεῦμα',
                'transliteration': 'pneuma',
                'pronunciation': 'pnyoo\'-mah',
                'part_of_speech': 'noun',
                'definition': 'wind, breath, spirit',
                'usage': 'From pneo; a current of air, i.e. breath (blast) or a breeze; by analogy or figuratively, a spirit, i.e. (human) the rational soul, (by implication) vital principle, mental disposition, etc., or (superhuman) an angel, demon, or (divine) God, Christ\'s spirit, the Holy Spirit: - ghost, life, spirit(-ual, -ually), mind.',
                'language': 'greek'
            },
            {
                'strongs_number': 'G5547',
                'original_word': 'Χριστός',
                'transliteration': 'Christos',
                'pronunciation': 'khris-tos\'',
                'part_of_speech': 'noun',
                'definition': 'anointed, the Christ, the Messiah',
                'usage': 'From chrio; anointed, i.e. the Messiah, an epithet of Jesus: - Christ.',
                'language': 'greek'
            }
        ]
        
        # Basic Hebrew words (sample)
        hebrew_words = [
            {
                'strongs_number': 'H430',
                'original_word': 'אֱלֹהִים',
                'transliteration': 'elohim',
                'pronunciation': 'el-o-heem\'',
                'part_of_speech': 'noun',
                'definition': 'God, gods',
                'usage': 'Plural of eloah; gods in the ordinary sense; but specifically used (in the plural thus, especially with the article) of the supreme God; occasionally applied by way of deference to magistrates; and sometimes as a superlative: - angels, X exceeding, God (gods)(-dess, -ly), X (very) great, judges, X mighty.',
                'language': 'hebrew'
            },
            {
                'strongs_number': 'H3068',
                'original_word': 'יְהֹוָה',
                'transliteration': 'Yehovah',
                'pronunciation': 'yeh-ho-vaw\'',
                'part_of_speech': 'proper noun',
                'definition': 'the proper name of the God of Israel',
                'usage': 'From hayah; (the) self-Existent or Eternal; Jehovah, Jewish national name of God: - Jehovah, the Lord.',
                'language': 'hebrew'
            },
            {
                'strongs_number': 'H157',
                'original_word': 'אָהַב',
                'transliteration': 'ahab',
                'pronunciation': 'aw-hab\'',
                'part_of_speech': 'verb',
                'definition': 'to love',
                'usage': 'A primitive root; to have affection for (sexually or otherwise): - (be-) love(-d, -ly, -r), like, friend.',
                'language': 'hebrew'
            },
            {
                'strongs_number': 'H7307',
                'original_word': 'רוּחַ',
                'transliteration': 'ruach',
                'pronunciation': 'roo\'-akh',
                'part_of_speech': 'noun',
                'definition': 'wind, breath, spirit',
                'usage': 'From ruwach; wind; by resemblance breath, i.e. a sensible (or even violent) exhalation; figuratively, life, anger, unsubstantiality; by extension, a region of the sky; by resemblance spirit, but only of a rational being (including its expression and functions): - air, anger, blast, breath, X cool, courage, mind, X quarter, X side, spirit((-ual)), tempest, X vain, (whirl-) wind(-y).',
                'language': 'hebrew'
            },
            {
                'strongs_number': 'H8064',
                'original_word': 'שָׁמַיִם',
                'transliteration': 'shamayim',
                'pronunciation': 'shaw-mah\'-yim',
                'part_of_speech': 'noun',
                'definition': 'heaven, sky',
                'usage': 'Dual of an unused singular shameh {shaw-meh\'}; from an unused root meaning to be lofty; the sky (as aloft; the dual perhaps alluding to the visible arch in which the clouds move, as well as to the higher ether where the celestial bodies revolve): - air, X astrologer, heaven(-s).',
                'language': 'hebrew'
            }
        ]
        
        # Add Greek words
        for word_data in greek_words:
            lexicon_entry = GreekHebrewLexicon(**word_data)
            db.session.add(lexicon_entry)
        
        # Add Hebrew words
        for word_data in hebrew_words:
            lexicon_entry = GreekHebrewLexicon(**word_data)
            db.session.add(lexicon_entry)
        
        db.session.commit()
        print(f"Seeded lexicon with {len(greek_words)} Greek and {len(hebrew_words)} Hebrew entries")

if __name__ == "__main__":
    from main import create_app
    app = create_app()
    seed_basic_lexicon(app)