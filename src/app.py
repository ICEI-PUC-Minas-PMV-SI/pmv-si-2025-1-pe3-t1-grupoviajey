from flask import Flask, render_template, send_from_directory, redirect
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "viajey_secret_key")

@app.route('/')
def index():
    # Redirect to desktop version for now
    return redirect('/desktop')

@app.route('/desktop')
def desktop():
    return send_from_directory('public', 'desktop.html')

@app.route('/mobile')
def mobile():
    return send_from_directory('public', 'index.html')

@app.route('/login')
def login():
    return send_from_directory('public', 'login.html')

@app.route('/register')
def register():
    return send_from_directory('public', 'register.html')

@app.route('/forgot-password')
def forgot_password():
    # Will be implemented later
    return "Página de recuperação de senha"

@app.route('/<path:path>')
def serve_static(path):
    if path.startswith('static/'):
        # Remove 'static/' prefix and serve from the static directory
        return send_from_directory('.', path)
    return send_from_directory('public', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)