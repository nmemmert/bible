"""
Authentication forms for user registration and login
"""
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField, SelectField, TextAreaField, IntegerField, HiddenField
from wtforms.validators import DataRequired, Email, EqualTo, Length, ValidationError, Optional
from models import User


class LoginForm(FlaskForm):
    """User login form"""
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Sign In')


class RegistrationForm(FlaskForm):
    """User registration form"""
    username = StringField('Username', validators=[DataRequired(), Length(min=4, max=25)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    password2 = PasswordField('Repeat Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Register')

    def validate_username(self, username):
        """Check if username is already taken"""
        user = User.query.filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError('Please use a different username.')

    def validate_email(self, email):
        """Check if email is already registered"""
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Please use a different email address.')


class UserPreferencesForm(FlaskForm):
    """User preferences form"""
    default_version = SelectField('Default Bible Version', choices=[
        ('KJV', 'King James Version'),
        ('ESV', 'English Standard Version'),
        ('NASB1995', 'New American Standard Bible 1995'),
        ('NIV2011', 'New International Version 2011'),
        ('NKJV', 'New King James Version'),
        ('NLT', 'New Living Translation'),
        ('CSB', 'Christian Standard Bible'),
        ('NET', 'New English Translation'),
        ('BSB', 'Berean Standard Bible'),
        ('ASV', 'American Standard Version'),
        ('WEB', 'World English Bible'),
        ('YLT', 'Young\'s Literal Translation'),
    ])
    font_size = SelectField('Font Size', choices=[
        ('small', 'Small'),
        ('medium', 'Medium'),
        ('large', 'Large'),
        ('xl', 'Extra Large')
    ])
    submit = SubmitField('Save Preferences')


class NoteForm(FlaskForm):
    """Form for adding/editing notes"""
    book = StringField('Book', validators=[DataRequired()])
    chapter = IntegerField('Chapter', validators=[DataRequired()])
    verse = IntegerField('Verse', validators=[Optional()])
    note_text = TextAreaField('Note', validators=[DataRequired()], render_kw={"rows": 8})
    tags = StringField('Tags (comma-separated)', validators=[Optional()])
    submit = SubmitField('Save Note')


class BookmarkForm(FlaskForm):
    """Form for adding bookmarks"""
    book = StringField('Book', validators=[DataRequired()])
    chapter = IntegerField('Chapter', validators=[DataRequired()])
    verse = IntegerField('Verse', validators=[Optional()])
    title = StringField('Bookmark Title', validators=[Optional()])
    submit = SubmitField('Add Bookmark')


class HighlightForm(FlaskForm):
    """Form for highlighting verses"""
    book = HiddenField('Book', validators=[DataRequired()])
    chapter = HiddenField('Chapter', validators=[DataRequired()])
    verse = HiddenField('Verse', validators=[DataRequired()])
    color = SelectField('Highlight Color', choices=[
        ('yellow', '🟡 Yellow'),
        ('blue', '🔵 Blue'),
        ('green', '🟢 Green'),
        ('red', '🔴 Red'),
        ('purple', '🟣 Purple'),
        ('orange', '🟠 Orange')
    ], default='yellow')
    submit = SubmitField('Highlight')


class StudyGuideForm(FlaskForm):
    """Form for creating study guides"""
    title = StringField('Title', validators=[DataRequired(), Length(max=200)])
    description = TextAreaField('Description', render_kw={"rows": 4})
    is_public = BooleanField('Make this study guide public')
    submit = SubmitField('Create Study Guide')


class StudyGuideSectionForm(FlaskForm):
    """Form for adding sections to study guides"""
    title = StringField('Section Title', validators=[DataRequired(), Length(max=200)])
    content = TextAreaField('Content', render_kw={"rows": 8})
    section_type = SelectField('Section Type', choices=[
        ('text', 'Text/Commentary'),
        ('passage', 'Bible Passage'),
        ('question', 'Study Question'),
        ('notes', 'Personal Notes Space')
    ])
    
    # For passage sections
    book = StringField('Book (for passage sections)', validators=[Optional()])
    chapter = IntegerField('Chapter (for passage sections)', validators=[Optional()])
    verse_start = IntegerField('Starting Verse (optional)', validators=[Optional()])
    verse_end = IntegerField('Ending Verse (optional)', validators=[Optional()])
    
    submit = SubmitField('Add Section')


class WordStudyForm(FlaskForm):
    """Form for word studies"""
    strongs_number = StringField('Strong\'s Number (e.g., G25, H430)', validators=[DataRequired()])
    title = StringField('Study Title', validators=[Optional(), Length(max=200)])
    notes = TextAreaField('Study Notes', render_kw={"rows": 10})
    submit = SubmitField('Save Word Study')