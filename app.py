from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__)

# Function to connect to the database
def connect_db():
    conn = sqlite3.connect('data.db')
    return conn

# Function to store information in the database
def store_info(password_hash, salt, iv, ciphertext):
    conn = connect_db()
    c = conn.cursor()
    c.execute('INSERT OR REPLACE INTO info (password_hash, salt, iv, ciphertext) VALUES (?, ?, ?, ?)',
              (password_hash, salt, iv, ciphertext))
    conn.commit()
    conn.close()

# Function to get information by password hash
def get_info(password_hash):
    conn = connect_db()
    c = conn.cursor()
    c.execute('SELECT salt, iv, ciphertext FROM info WHERE password_hash = ?', (password_hash,))
    row = c.fetchone()
    conn.close()
    return row

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

# Handle data retrieval by password hash
@app.route('/submit', methods=['POST'])
def submit():
    data = request.get_json()
    password_hash = data.get('password_hash')

    # Retrieve the information from the database based on the hash
    existing_info = get_info(password_hash)

    if existing_info:
        salt, iv, ciphertext = existing_info
        return jsonify({'salt': salt, 'iv': iv, 'ciphertext': ciphertext})
    else:
        return jsonify({'info': ''})

# Save encrypted data
@app.route('/save', methods=['POST'])
def save():
    data = request.get_json()
    password_hash = data.get('password_hash')
    salt = data.get('salt')
    iv = data.get('iv')
    ciphertext = data.get('ciphertext')

    # Store the encrypted information in the database
    store_info(password_hash, salt, iv, ciphertext)

    return jsonify({'success': 'Information saved successfully.'})

if __name__ == '__main__':
    # Create the database table if it doesn't exist
    conn = connect_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS info (
            password_hash TEXT PRIMARY KEY,
            salt TEXT,
            iv TEXT,
            ciphertext TEXT
        )
    ''')
    conn.close()

    app.run(debug=True)
