# 📖 Bible Study Hub - Enhanced Edition

A comprehensive, self-hosted Bible study application with user authentication, personal study tools, Greek/Hebrew lexicon support, and advanced study features.

## 🚀 New Features

### 🔐 User Authentication
- User registration and secure login
- Personal user profiles with preferences
- Session management and security

### 📝 Personal Study Tools
- **Notes & Annotations**: Take detailed notes on any verse or chapter
- **Bookmarks**: Save favorite passages for quick access
- **Highlights**: Color-code verses with 6 different highlight colors
- **Tags**: Organize notes with custom tags for easy searching

### 📖 Study Guide Builder
- Create structured study guides with multiple sections
- Different section types: Text, Bible Passages, Questions, Personal Notes
- Share study guides publicly or keep them private
- Template system for common study patterns

### 🔤 Greek & Hebrew Lexicon
- Strong's Concordance integration
- Original language word definitions and etymology
- Pronunciation guides and morphological analysis
- Personal word study notes and cross-references

### 📊 Enhanced Bible Reading
- All original Bible versions supported
- Interactive verse selection and annotation
- Cross-references and commentary integration
- Responsive design for mobile and desktop

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bible
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Initialize the database**
   ```bash
   python seed_lexicon.py
   ```

4. **Run the enhanced application**
   ```bash
   python run_enhanced.py
   ```

5. **Access the application**
   - Open your browser to `http://localhost:5000`
   - Register a new account to access study tools
   - Start exploring God's Word with enhanced features!

### Environment Variables

- `PORT`: Server port (default: 5000)
- `DEBUG`: Enable debug mode (default: False)
- `SECRET_KEY`: Flask secret key (auto-generated if not set)

## 📚 Bible Versions Included

- **King James Version (KJV)** - Classic translation
- **English Standard Version (ESV)** - Modern accuracy
- **New American Standard Bible 1995 (NASB)** - Literal translation
- **New International Version 2011 (NIV)** - Contemporary language
- **New King James Version (NKJV)** - Updated classic
- **New Living Translation (NLT)** - Thought-for-thought
- **Christian Standard Bible (CSB)** - Balanced approach
- **New English Translation (NET)** - Extensive notes
- **Berean Standard Bible (BSB)** - Modern literal
- **American Standard Version (ASV)** - Historical accuracy
- **World English Bible (WEB)** - Public domain
- **Young's Literal Translation (YLT)** - Word-for-word
- And many more...

## 🎯 Key Features in Detail

### Personal Notes System
- **Verse-level notes**: Attach notes to specific verses
- **Chapter-level notes**: General observations about entire chapters
- **Tagging system**: Organize notes with custom tags
- **Search functionality**: Find notes quickly by content or tags
- **Export capability**: Back up your study notes

### Bookmark Management
- **Quick bookmarking**: One-click bookmark saving
- **Custom titles**: Add personal titles to bookmarks
- **Organized access**: View all bookmarks in one place
- **Direct navigation**: Jump to bookmarked passages instantly

### Highlight System
- **Six colors**: Yellow, Blue, Green, Red, Purple, Orange
- **Persistent highlighting**: Highlights saved across sessions
- **Easy management**: Add, change, or remove highlights easily
- **Visual study aid**: See patterns and themes at a glance

### Study Guide Builder
- **Flexible structure**: Create guides with multiple sections
- **Section types**:
  - Text/Commentary sections for explanations
  - Bible Passage sections with automatic formatting
  - Study Question sections for reflection
  - Personal Notes sections for journaling
- **Public sharing**: Share guides with the community
- **Template library**: Start with proven study patterns

### Greek & Hebrew Integration
- **Strong's Concordance**: Complete lexicon with definitions
- **Original languages**: Greek and Hebrew word studies
- **Morphological data**: Grammar and syntax information
- **Etymology**: Word origins and development
- **Cross-references**: Related words and concepts
- **Personal studies**: Save your own word study notes

### Advanced Search
- **Multi-version search**: Search across all Bible versions
- **Strong's number search**: Find all occurrences of Greek/Hebrew words
- **Advanced filters**: Narrow results by book, chapter, or version
- **Search history**: Review previous searches

## 🔧 Technical Details

### Architecture
- **Backend**: Flask (Python web framework)
- **Database**: SQLite (for user data and annotations)
- **Authentication**: Flask-Login with bcrypt password hashing
- **Frontend**: Responsive HTML5/CSS3/JavaScript
- **Bible Data**: Compressed JSON format for fast access

### Security Features
- **Password hashing**: Secure bcrypt encryption
- **Session management**: Server-side session handling
- **CSRF protection**: Form security against attacks
- **SQL injection prevention**: Parameterized queries
- **XSS protection**: Content sanitization

### Performance Optimizations
- **Compressed Bible data**: Fast loading with pbz2 compression
- **Caching system**: Intelligent caching for repeated requests
- **Lazy loading**: Load content as needed
- **Minified assets**: Optimized CSS and JavaScript

## 📱 Mobile Support

The application is fully responsive and works great on:
- **Desktop browsers** (Chrome, Firefox, Safari, Edge)
- **Tablets** (iPad, Android tablets)
- **Mobile phones** (iPhone, Android)
- **Progressive Web App** features for offline access

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report bugs** - Submit issues with detailed descriptions
2. **Suggest features** - Share ideas for new study tools
3. **Add Bible versions** - Help expand language support
4. **Improve documentation** - Help others learn the system
5. **Code contributions** - Submit pull requests for improvements

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- **Bible text sources** - Various public domain and licensed translations
- **Strong's Concordance** - Greek and Hebrew lexicon data
- **Flask community** - Excellent web framework and extensions
- **Contributors** - Everyone who helps improve this tool

## 📞 Support

- **Documentation**: Check this README and inline help
- **Issues**: Submit bug reports on GitHub
- **Features**: Request new features via GitHub issues
- **Community**: Join discussions and share study insights

---

*"Study to show thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth." - 2 Timothy 2:15*

**Made with ❤️ for Bible study and spiritual growth**