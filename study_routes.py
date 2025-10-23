"""
Study tool routes for notes, bookmarks, highlights, and study guides
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import current_user, login_required
from models import db, Note, Bookmark, Highlight, StudyGuide, StudyGuideSection, WordStudy, GreekHebrewLexicon
from forms import NoteForm, StudyGuideForm, StudyGuideSectionForm, WordStudyForm

study_bp = Blueprint('study', __name__)

# Notes routes
@study_bp.route('/notes')
@login_required
def notes():
    """Display user's notes"""
    page = request.args.get('page', 1, type=int)
    notes = Note.query.filter_by(user_id=current_user.id)\
                     .order_by(Note.created_at.desc())\
                     .paginate(page=page, per_page=20, error_out=False)
    return render_template('study/notes.html', title='My Notes', notes=notes)

@study_bp.route('/add_note', methods=['GET', 'POST'])
@login_required
def add_note():
    """Add a new note"""
    form = NoteForm()
    
    # Pre-populate with URL parameters if provided
    if request.method == 'GET':
        form.book.data = request.args.get('book', '')
        form.chapter.data = request.args.get('chapter', type=int)
        form.verse.data = request.args.get('verse', type=int)
    
    if form.validate_on_submit():
        note = Note(
            user_id=current_user.id,
            book=form.book.data,
            chapter=form.chapter.data,
            verse=form.verse.data,
            note_text=form.note_text.data,
            tags=form.tags.data
        )
        db.session.add(note)
        db.session.commit()
        flash('Note saved successfully!', 'success')
        return redirect(url_for('study.notes'))
    
    return render_template('study/add_note.html', title='Add Note', form=form)

@study_bp.route('/edit_note/<int:note_id>', methods=['GET', 'POST'])
@login_required
def edit_note(note_id):
    """Edit an existing note"""
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first_or_404()
    form = NoteForm()
    
    if form.validate_on_submit():
        note.book = form.book.data
        note.chapter = form.chapter.data
        note.verse = form.verse.data
        note.note_text = form.note_text.data
        note.tags = form.tags.data
        db.session.commit()
        flash('Note updated successfully!', 'success')
        return redirect(url_for('study.notes'))
    
    elif request.method == 'GET':
        form.book.data = note.book
        form.chapter.data = note.chapter
        form.verse.data = note.verse
        form.note_text.data = note.note_text
        form.tags.data = note.tags
    
    return render_template('study/edit_note.html', title='Edit Note', form=form, note=note)

@study_bp.route('/delete_note/<int:note_id>', methods=['POST'])
@login_required
def delete_note(note_id):
    """Delete a note"""
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first_or_404()
    db.session.delete(note)
    db.session.commit()
    flash('Note deleted successfully!', 'success')
    return redirect(url_for('study.notes'))

# Bookmarks routes
@study_bp.route('/bookmarks')
@login_required
def bookmarks():
    """Display user's bookmarks"""
    bookmarks = Bookmark.query.filter_by(user_id=current_user.id)\
                             .order_by(Bookmark.created_at.desc())\
                             .all()
    return render_template('study/bookmarks.html', title='My Bookmarks', bookmarks=bookmarks)

@study_bp.route('/add_bookmark', methods=['POST'])
@login_required
def add_bookmark():
    """Add a bookmark via AJAX"""
    book = request.json.get('book')
    chapter = request.json.get('chapter')
    verse = request.json.get('verse')
    title = request.json.get('title', '')
    
    if not book or not chapter:
        return jsonify({'error': 'Book and chapter are required'}), 400
    
    # Check if bookmark already exists
    existing = Bookmark.query.filter_by(
        user_id=current_user.id,
        book=book,
        chapter=chapter,
        verse=verse
    ).first()
    
    if existing:
        return jsonify({'error': 'Bookmark already exists'}), 400
    
    bookmark = Bookmark(
        user_id=current_user.id,
        book=book,
        chapter=chapter,
        verse=verse,
        title=title
    )
    db.session.add(bookmark)
    db.session.commit()
    
    return jsonify({'message': 'Bookmark added successfully!'})

@study_bp.route('/delete_bookmark/<int:bookmark_id>', methods=['POST'])
@login_required
def delete_bookmark(bookmark_id):
    """Delete a bookmark"""
    bookmark = Bookmark.query.filter_by(id=bookmark_id, user_id=current_user.id).first_or_404()
    db.session.delete(bookmark)
    db.session.commit()
    flash('Bookmark removed successfully!', 'success')
    return redirect(url_for('study.bookmarks'))

# Highlights routes
@study_bp.route('/add_highlight', methods=['POST'])
@login_required
def add_highlight():
    """Add or update a highlight via AJAX"""
    book = request.json.get('book')
    chapter = request.json.get('chapter')
    verse = request.json.get('verse')
    color = request.json.get('color', 'yellow')
    
    if not book or not chapter or not verse:
        return jsonify({'error': 'Book, chapter, and verse are required'}), 400
    
    # Check if highlight already exists
    existing = Highlight.query.filter_by(
        user_id=current_user.id,
        book=book,
        chapter=chapter,
        verse=verse
    ).first()
    
    if existing:
        existing.color = color
        db.session.commit()
        return jsonify({'message': 'Highlight updated successfully!'})
    else:
        highlight = Highlight(
            user_id=current_user.id,
            book=book,
            chapter=chapter,
            verse=verse,
            color=color
        )
        db.session.add(highlight)
        db.session.commit()
        return jsonify({'message': 'Highlight added successfully!'})

@study_bp.route('/remove_highlight', methods=['POST'])
@login_required
def remove_highlight():
    """Remove a highlight via AJAX"""
    book = request.json.get('book')
    chapter = request.json.get('chapter')
    verse = request.json.get('verse')
    
    highlight = Highlight.query.filter_by(
        user_id=current_user.id,
        book=book,
        chapter=chapter,
        verse=verse
    ).first()
    
    if highlight:
        db.session.delete(highlight)
        db.session.commit()
        return jsonify({'message': 'Highlight removed successfully!'})
    else:
        return jsonify({'error': 'Highlight not found'}), 404

# Study Guides routes
@study_bp.route('/study_guides')
@login_required
def study_guides():
    """Display user's study guides"""
    guides = StudyGuide.query.filter_by(user_id=current_user.id)\
                            .order_by(StudyGuide.updated_at.desc())\
                            .all()
    return render_template('study/study_guides.html', title='My Study Guides', guides=guides)

@study_bp.route('/create_study_guide', methods=['GET', 'POST'])
@login_required
def create_study_guide():
    """Create a new study guide"""
    form = StudyGuideForm()
    
    if form.validate_on_submit():
        guide = StudyGuide(
            user_id=current_user.id,
            title=form.title.data,
            description=form.description.data,
            is_public=form.is_public.data
        )
        db.session.add(guide)
        db.session.commit()
        flash('Study guide created successfully!', 'success')
        return redirect(url_for('study.view_study_guide', guide_id=guide.id))
    
    return render_template('study/create_study_guide.html', title='Create Study Guide', form=form)

@study_bp.route('/study_guide/<int:guide_id>')
@login_required
def view_study_guide(guide_id):
    """View a study guide"""
    guide = StudyGuide.query.filter_by(id=guide_id).first_or_404()
    
    # Check permissions
    if guide.user_id != current_user.id and not guide.is_public:
        flash('You do not have permission to view this study guide.', 'danger')
        return redirect(url_for('study.study_guides'))
    
    sections = StudyGuideSection.query.filter_by(study_guide_id=guide_id)\
                                    .order_by(StudyGuideSection.order_index)\
                                    .all()
    
    return render_template('study/view_study_guide.html', 
                         title=guide.title, 
                         guide=guide, 
                         sections=sections)

@study_bp.route('/study_guide/<int:guide_id>/add_section', methods=['GET', 'POST'])
@login_required
def add_study_guide_section(guide_id):
    """Add a section to a study guide"""
    guide = StudyGuide.query.filter_by(id=guide_id, user_id=current_user.id).first_or_404()
    form = StudyGuideSectionForm()
    
    if form.validate_on_submit():
        # Get the next order index
        max_order = db.session.query(db.func.max(StudyGuideSection.order_index))\
                             .filter_by(study_guide_id=guide_id).scalar() or 0
        
        section = StudyGuideSection(
            study_guide_id=guide_id,
            title=form.title.data,
            content=form.content.data,
            section_type=form.section_type.data,
            order_index=max_order + 1,
            book=form.book.data,
            chapter=form.chapter.data,
            verse_start=form.verse_start.data,
            verse_end=form.verse_end.data
        )
        db.session.add(section)
        db.session.commit()
        flash('Section added successfully!', 'success')
        return redirect(url_for('study.view_study_guide', guide_id=guide_id))
    
    return render_template('study/add_study_guide_section.html', 
                         title='Add Section', 
                         form=form, 
                         guide=guide)

@study_bp.route('/delete_study_guide/<int:guide_id>', methods=['POST'])
@login_required
def delete_study_guide(guide_id):
    """Delete a study guide and all its sections"""
    guide = StudyGuide.query.filter_by(id=guide_id, user_id=current_user.id).first_or_404()
    
    # Delete all sections first (cascade should handle this, but being explicit)
    StudyGuideSection.query.filter_by(study_guide_id=guide_id).delete()
    
    # Delete the study guide
    db.session.delete(guide)
    db.session.commit()
    
    flash(f'Study guide "{guide.title}" has been deleted successfully!', 'success')
    return redirect(url_for('study.study_guides'))

# Word Studies routes
@study_bp.route('/word_studies')
@login_required
def word_studies():
    """Display user's word studies"""
    studies = WordStudy.query.filter_by(user_id=current_user.id)\
                            .order_by(WordStudy.updated_at.desc())\
                            .all()
    return render_template('study/word_studies.html', title='My Word Studies', studies=studies)

@study_bp.route('/create_word_study', methods=['GET', 'POST'])
@login_required
def create_word_study():
    """Create a new word study"""
    form = WordStudyForm()
    
    if form.validate_on_submit():
        study = WordStudy(
            user_id=current_user.id,
            strongs_number=form.strongs_number.data.upper(),
            title=form.title.data,
            notes=form.notes.data
        )
        db.session.add(study)
        db.session.commit()
        flash('Word study created successfully!', 'success')
        return redirect(url_for('study.word_studies'))
    
    return render_template('study/create_word_study.html', title='Create Word Study', form=form)

@study_bp.route('/lexicon/<strongs_number>')
def lexicon_lookup(strongs_number):
    """Look up a word in the Greek/Hebrew lexicon"""
    entry = GreekHebrewLexicon.query.filter_by(strongs_number=strongs_number.upper()).first()
    if not entry:
        flash(f'Lexicon entry for {strongs_number} not found.', 'warning')
        return redirect(url_for('main_page'))
    
    # Get user's word study if logged in
    user_study = None
    if current_user.is_authenticated:
        user_study = WordStudy.query.filter_by(
            user_id=current_user.id,
            strongs_number=strongs_number.upper()
        ).first()
    
    return render_template('study/lexicon.html', 
                         title=f'Lexicon: {entry.original_word}', 
                         entry=entry,
                         user_study=user_study)

# API endpoints for getting user's annotations
@study_bp.route('/api/get_user_data/<book>/<int:chapter>')
@login_required
def get_user_data(book, chapter):
    """Get user's notes, highlights, and bookmarks for a chapter"""
    notes = Note.query.filter_by(user_id=current_user.id, book=book, chapter=chapter).all()
    highlights = Highlight.query.filter_by(user_id=current_user.id, book=book, chapter=chapter).all()
    bookmarks = Bookmark.query.filter_by(user_id=current_user.id, book=book, chapter=chapter).all()
    
    return jsonify({
        'notes': [{
            'verse': note.verse,
            'text': note.note_text,
            'tags': note.tags,
            'created_at': note.created_at.isoformat()
        } for note in notes],
        'highlights': [{
            'verse': highlight.verse,
            'color': highlight.color
        } for highlight in highlights],
        'bookmarks': [{
            'verse': bookmark.verse,
            'title': bookmark.title
        } for bookmark in bookmarks]
    })