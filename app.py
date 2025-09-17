from flask import Flask, render_template, request
import os
from datetime import datetime

app = Flask(__name__)

# Ordner für Aufnahmen
UPLOAD_FOLDER = "recordings"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Wörterliste (Test: 3 Wörter)
WORDS = ["Haus", "Baum", "Dreck"]

@app.route("/")
def index():
    return render_template("index.html", words=WORDS)

@app.route("/upload", methods=["POST"])
def upload():
    name = request.form.get("name")
    word = request.form.get("word")
    audio = request.files["audio"]

    if not name or not word or not audio:
        return "Fehler: Name, Wort oder Audio fehlt", 400

    # Dateiname: Wort_Name.wav
    filename = f"{word}_{name}.wav"
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    audio.save(filepath)
    return "OK"

if __name__ == "__main__":
    app.run(debug=True)
