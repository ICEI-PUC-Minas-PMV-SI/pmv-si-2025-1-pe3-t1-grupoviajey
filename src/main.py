from flask import Flask, send_from_directory, redirect
import os

app = Flask(__name__, static_folder='public')

@app.route('/')
def index():
    return send_from_directory('public', 'desktop.html')

@app.route('/explorar')
def explorar():
    return send_from_directory('public', 'explorar.html')

@app.route('/detail')
def detail():
    return send_from_directory('public', 'detail.html')

@app.route('/itinerary')
def itinerary():
    return send_from_directory('public', 'itinerary.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/public/<path:path>')
def serve_public(path):
    return send_from_directory('public', path)

# Fallback
@app.route('/<path:path>')
def fallback(path):
    try:
        return send_from_directory('public', path)
    except:
        return redirect('/')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))