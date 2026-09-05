from flask import Flask, render_template, request, jsonify
import json, os
from datetime import datetime

app = Flask(__name__)
COMMENTS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'comments.json')

# ── Cache headers pentru static (Render nu setează asta by default) ──
# Fără asta, browserul reverifică fiecare imagine/video/css la fiecare vizită
# (304 round-trip pe zeci de fișiere = latency inutilă, deși fără cost de bandwidth mare).
# max-age=1 an + immutable e sigur DOAR dacă redenumești fișierul la update (cache-busting),
# altfel clienții vechi rămân blocați pe versiunea cache-uită. Vezi nota din răspuns.
@app.after_request
def add_cache_headers(response):
    if request.path.startswith('/static/'):
        if request.path.startswith('/static/videos/') or request.path.startswith('/static/img/') or request.path.startswith('/static/gifs/'):
            response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
        else:
            # css/js: cache mai scurt + revalidare, ca să nu rămâi blocat pe un bug vechi
            response.headers['Cache-Control'] = 'public, max-age=3600, must-revalidate'
    return response

def load_comments():
    if not os.path.exists(COMMENTS_FILE):
        return []
    with open(COMMENTS_FILE, 'r', encoding='utf-8') as f:
        try: return json.load(f)
        except: return []

def save_comments(data):
    with open(COMMENTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/makeup')
def makeup():
    return render_template('makeup.html')

@app.route('/manichiura')
def manichiura():
    return render_template('manichiura.html')

@app.route('/extensii-gene')
def extensii_gene():
    return render_template('extensii_gene.html')

@app.route('/bodypaint')
def bodypaint():
    return render_template('bodypaint.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/api/comments', methods=['GET'])
def get_comments():
    return jsonify(load_comments())

@app.route('/api/comments', methods=['POST'])
def post_comment():
    d = request.get_json()
    name    = d.get('name','').strip()
    message = d.get('message','').strip()
    rating  = int(d.get('rating', 5))
    if not name or not message:
        return jsonify({'error': 'Completează toate câmpurile'}), 400
    if not (1 <= rating <= 5):
        return jsonify({'error': 'Rating invalid'}), 400
    comments = load_comments()
    c = {'id': len(comments)+1, 'name': name, 'message': message,
         'rating': rating, 'date': datetime.now().strftime('%d.%m.%Y')}
    comments.append(c)
    save_comments(comments)
    return jsonify(c), 201

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
