
## ✅ TODO List for `rewrite` Branch

### 🧑‍🎨 UI Fixes
- [x] **Word Study Page**
  - [x] Make white text readable (adjust contrast or background)
  - [x] Make "Study Tools" header readable
- [x] **Bible Search Page**
  - [x] Make header readable
- [x] **Lexicon Cards**
  - [x] Remove "View in Bible" button
  - [x] Add verses where the word appears to each card
  - [x] Fix issue where cards can't be exited (return to Lexicon main page)
  - [x] for greek words find verse button search bib.pdf or other version of the file .txt

### 🔍 Functionality Improvements
- [x] **Study Resources**
  - [x] Ensure search works for each resource
  - [x] search the resources like the lexicon greek find verse function.
- [x] **PDF Resources**
  - [x] Add support for uploading PDFs
  - [x] Make PDFs searchable later like the greek find verse function
- [x] **Verse of the Day**
  - [x] Pull verse from BSB version
  - [x] Generate or attach a daily image with the verse
  - [x] Add option to share verse/image on social media
  - [x] Allow users to set daily reminders for verse notifications
  - [x] Enable users to customize verse display (font, background, etc.)

### 👤 User Profile Enhancements
# Todo List

- [x] Add user profile page
  - [x] add profile link after login
  - [x] make sure all text on profile page is readable
  - [x] Create Profile component with sections for notes, bookmarks, highlights, study guides, word studies, recent activity, and settings
  - [x] Implement comprehensive user content management (CRUD operations for notes, bookmarks, highlights)
  - [x] Add authentication and routing for profile page
  - [x] Fix API authentication issues across all components
  - [x] Fix PDF download functionality by organizing files in public directory
  - [x] Improve UI/UX with collapsible upload sections and better resource management
  - [x] Implement text selection and highlighting in Bible reader
  - [x] Add search functionality for study resources
  - [x] Complete integration testing and bug fixes
- [x] **Study Guides**
  - [x] Fix issue with blank guides appearing
  - [ ] Ensure new users start with no guides
- [x] **Notes**
 - [x] make notes searchable
 - [x] allow users to organize notes by tags or categories
 - [x] enable note sharing with other users and exporting to formats like PDF or Word
  - [x] add rich text formatting options for notes

### ⚙️ Backend Improvements
- [ ] Optimize database queries for faster response times
- [ ] Implement caching for frequently accessed data
- [ ] Set up automated backups for user data