"""
Database models for the Bible study application
"""
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(UserMixin, db.Model):
    """User model for authentication and personalization"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # User preferences
    default_version = db.Column(db.String(20), default='KJV')
    font_size = db.Column(db.String(10), default='medium')
    
    # Relationships
    notes = db.relationship('Note', backref='user', lazy=True, cascade='all, delete-orphan')
    bookmarks = db.relationship('Bookmark', backref='user', lazy=True, cascade='all, delete-orphan')
    study_guides = db.relationship('StudyGuide', backref='user', lazy=True, cascade='all, delete-orphan')
    highlights = db.relationship('Highlight', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        """Set password hash"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check password"""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'


class Note(db.Model):
    """Personal notes on Bible verses"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book = db.Column(db.String(50), nullable=False)
    chapter = db.Column(db.Integer, nullable=False)
    verse = db.Column(db.Integer, nullable=True)  # Null for chapter-level notes
    note_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    tags = db.Column(db.String(500))  # Comma-separated tags
    
    def __repr__(self):
        return f'<Note {self.book} {self.chapter}:{self.verse}>'


class Bookmark(db.Model):
    """User bookmarks for quick access to verses/chapters"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book = db.Column(db.String(50), nullable=False)
    chapter = db.Column(db.Integer, nullable=False)
    verse = db.Column(db.Integer, nullable=True)  # Null for chapter bookmarks
    title = db.Column(db.String(200))  # Custom title for bookmark
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Bookmark {self.book} {self.chapter}:{self.verse}>'


class Highlight(db.Model):
    """User highlights with different colors"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book = db.Column(db.String(50), nullable=False)
    chapter = db.Column(db.Integer, nullable=False)
    verse = db.Column(db.Integer, nullable=False)
    color = db.Column(db.String(20), default='yellow')  # yellow, blue, green, red, purple
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Highlight {self.book} {self.chapter}:{self.verse} ({self.color})>'


class StudyGuide(db.Model):
    """Study guides created by users"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    is_template = db.Column(db.Boolean, default=False)
    is_public = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sections = db.relationship('StudyGuideSection', backref='study_guide', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<StudyGuide {self.title}>'


class StudyGuideSection(db.Model):
    """Sections within a study guide"""
    id = db.Column(db.Integer, primary_key=True)
    study_guide_id = db.Column(db.Integer, db.ForeignKey('study_guide.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    order_index = db.Column(db.Integer, default=0)
    section_type = db.Column(db.String(50), default='text')  # text, passage, question, notes
    
    # For passage sections
    book = db.Column(db.String(50))
    chapter = db.Column(db.Integer)
    verse_start = db.Column(db.Integer)
    verse_end = db.Column(db.Integer)
    
    def __repr__(self):
        return f'<StudyGuideSection {self.title}>'


class GreekHebrewLexicon(db.Model):
    """Greek and Hebrew word definitions and Strong's numbers"""
    id = db.Column(db.Integer, primary_key=True)
    strongs_number = db.Column(db.String(10), unique=True, nullable=False)  # e.g., "G25", "H430"
    original_word = db.Column(db.String(100), nullable=False)
    transliteration = db.Column(db.String(100))
    pronunciation = db.Column(db.String(100))
    part_of_speech = db.Column(db.String(50))
    definition = db.Column(db.Text, nullable=False)
    usage = db.Column(db.Text)
    language = db.Column(db.String(10), nullable=False)  # 'greek' or 'hebrew'
    
    def __repr__(self):
        return f'<Lexicon {self.strongs_number}: {self.original_word}>'


class WordStudy(db.Model):
    """User's word studies and research"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    strongs_number = db.Column(db.String(10), nullable=False)
    title = db.Column(db.String(200))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<WordStudy {self.strongs_number}>'