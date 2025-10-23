"""
Authentication and user management routes
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, session
from flask_login import login_user, logout_user, current_user, login_required
from models import User, db
from forms import LoginForm, RegistrationForm, UserPreferencesForm
import time

auth_bp = Blueprint('auth', __name__)

def check_rate_limit():
    """Simple rate limiting for authentication attempts"""
    now = time.time()
    attempts = session.get('login_attempts', [])
    
    # Remove attempts older than 15 minutes
    attempts = [t for t in attempts if now - t < 900]
    
    # Check if too many attempts
    if len(attempts) >= 5:
        return False, 900 - (now - attempts[0])  # Return remaining wait time
    
    return True, 0

def record_attempt():
    """Record a login attempt"""
    now = time.time()
    attempts = session.get('login_attempts', [])
    attempts.append(now)
    session['login_attempts'] = attempts

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """User login route"""
    if current_user.is_authenticated:
        return redirect(url_for('main_page'))
    
    # Check rate limiting
    allowed, wait_time = check_rate_limit()
    if not allowed:
        flash(f'Too many login attempts. Please wait {int(wait_time)} seconds.', 'danger')
        return render_template('auth/login.html', title='Sign In', form=LoginForm())
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember_me.data)
            # Clear failed attempts on successful login
            session.pop('login_attempts', None)
            next_page = request.args.get('next')
            if not next_page or not next_page.startswith('/'):
                next_page = url_for('main_page')
            flash(f'Welcome back, {user.username}!', 'success')
            return redirect(next_page)
        else:
            record_attempt()
            flash('Invalid username or password', 'danger')
    
    return render_template('auth/login.html', title='Sign In', form=form)


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """User registration route"""
    if current_user.is_authenticated:
        return redirect(url_for('main_page'))
    
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now registered!', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/register.html', title='Register', form=form)


@auth_bp.route('/logout')
@login_required
def logout():
    """User logout route"""
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main_page'))


@auth_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """User profile and preferences"""
    form = UserPreferencesForm()
    
    if form.validate_on_submit():
        current_user.default_version = form.default_version.data
        current_user.font_size = form.font_size.data
        db.session.commit()
        flash('Your preferences have been updated.', 'success')
        return redirect(url_for('auth.profile'))
    
    # Pre-populate form with current user data
    elif request.method == 'GET':
        form.default_version.data = current_user.default_version
        form.font_size.data = current_user.font_size
    
    return render_template('auth/profile.html', title='Profile', form=form)