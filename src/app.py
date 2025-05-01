from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('public', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path.startswith('static/'):
        # Remove 'static/' prefix and serve from the static directory
        return send_from_directory('.', path)
    return send_from_directory('public', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)