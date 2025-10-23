from flask import Flask, jsonify
import time
import os

# Initialize Bible search and load Bibles at module level
start = time.perf_counter()
try:
    from multi_bible_search import BibleSearch
    searcher = BibleSearch()
    # Read ESV API key from environment variable or file
    api_key: str = os.environ.get('ESV_API_KEY', '')
    if not api_key:
        try:
            with open("esv-api-key.txt", "r", encoding="utf-8") as key_in:
                key: str = key_in.read().strip()
                if key and key != "<key-goes-here>":
                    api_key = key
        except IOError:
            # ESV API key is optional, continue without it
            pass

    from bibles import *
    bibles = {
              'ACV': ACV(),
              'AKJV': AKJV(),
              'AMP': AMP(),
              'ASV': ASV(),
              'BBE': BBE(),
              'BSB': BSB(),
              'CSB': CSB(),
              'Darby': Darby(),
              'DRA': DRA(),
              'EBR': EBR(),
              'ESV': ESV() if len(api_key) <= 0 else ESV(api_key),
              'GNV': GNV(),
              'KJV': KJV(),
              'KJV 1611': KJV1611(),
              'LSV': LSV(),
              'MSG': MSG(),
              'NASB 1995': NASB1995(),
              'NET': NET(),
              'NIV 1984': NIV1984(),
              'NIV 2011': NIV2011(),
              'NKJV': NKJV(),
              'NLT': NLT(),
              'RNKJV': RNKJV(),
              'RSV': RSV(),
              'RWV': RWV(),
              'UKJV': UKJV(),
              'WEB': WEB(),
              'YLT': YLT(),
              'BTX3': BTX3(),
              'RV1960': RV1960(),
              'RV2004': RV2004(),
              }

    end = time.perf_counter()
    print(f"Loaded Bibles and search in {end - start:.6f} seconds")
except Exception as e:
    print(f"Error loading Bibles: {e}")
    searcher = None
    bibles = {}

app = Flask(__name__)

@app.route('/test')
def test():
    return jsonify({'message': 'Server is working'})

@app.route('/search_endpoint/', methods=['GET'])
def search_endpoint():
    """
    Endpoint queried by the frontend search.
    :return: Search results with references and verse content.
    """
    return jsonify({'results': []})

@app.route('/bible/versions', methods=['GET'])
def get_bible_versions():
    """Get available Bible versions"""
    print(f"bibles keys: {list(bibles.keys())[:5]}")  # Debug print
    try:
        versions = []
        for version_key in sorted(bibles.keys()):
            versions.append({
                'id': version_key.lower(),
                'abbreviation': version_key
            })
        return jsonify(versions)
    except Exception as e:
        print(f"Error: {e}")  # Debug print
        return jsonify({'error': str(e)}), 500

# @app.route('/bible/<version>/<book>/<int:chapter>', methods=['GET'])
# def get_bible_chapter(version: str, book: str, chapter: int):
    # """Get a specific chapter from a Bible version"""
    # version = version.upper()
    # if version not in bibles:
    #     return jsonify({'error': f'Bible version {version} not found'}), 404

    # try:
    #     content = bibles[version].get_passage(book, chapter)
    #     if not content:
    #         return jsonify({'error': f'Chapter {chapter} of {book} not found'}), 404

    #     # Return the content in a format the frontend can use
    #     chapter_data = {
    #         'book': content.get('book', book),
    #         'chapter': content.get('chapter', chapter),
    #         'version': version.lower(),
    #         'verses': []
    #     }

    #     # Flatten verses from all headings
    #     for heading, verse_list in content.get('verses', {}).items():
    #         for verse in verse_list:
    #             # Parse verse format: "1 In the beginning..."
    #             if ' ' in verse:
    #                 verse_num_str, verse_text = verse.split(' ', 1)
    #                 try:
    #                     verse_num = int(verse_num_str)
    #                     chapter_data['verses'].append({
    #                         'verse': verse_num,
    #                         'text': verse_text.strip()
    #                     })
    #                 except ValueError:
    #                     # Skip verses that don't start with a number
    #                     continue

    #     return jsonify(chapter_data)
    # except Exception as e:
    #     return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5002)