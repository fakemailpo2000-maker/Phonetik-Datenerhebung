let mediaRecorder;
let chunks = [];
let isRecording = false;
let activeButton = null;

// Aktiviere Buttons, wenn Name eingetragen wurde
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("username").addEventListener("input", (e) => {
        const name = e.target.value.trim();
        document.querySelectorAll("button").forEach(btn => {
            btn.disabled = (name === "");
        });
    });
});

function startRecording(word) {
    if (isRecording) return; // keine Doppelstarts
    const name = document.getElementById("username").value.trim();
    if (!name) {
        alert("Bitte geben Sie zuerst Ihren Namen ein.");
        return;
    }

    // Status-Elemente
    const row = event.target.closest(".word-row");
    const timerEl = row.querySelector(".timer");
    const statusEl = row.querySelector(".status");

    // Buttons sperren
    document.querySelectorAll("button").forEach(btn => btn.disabled = true);
    isRecording = true;
    activeButton = event.target;

    // Timer
    let timeLeft = 3;
    timerEl.textContent = ` Aufnahme: ${timeLeft}s`;

    const countdown = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft > 0) {
            timerEl.textContent = ` Aufnahme: ${timeLeft}s`;
        } else {
            clearInterval(countdown);
            stopRecording(word, name, timerEl, statusEl);
        }
    }, 1000);

    // Mikrofon starten
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            chunks = [];
            mediaRecorder.ondataavailable = e => chunks.push(e.data);

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                uploadRecording(blob, word, name, statusEl);

                // Buttons wieder freigeben
                document.querySelectorAll("button").forEach(btn => btn.disabled = false);
                isRecording = false;
                activeButton = null;
                timerEl.textContent = "";
            };
        })
        .catch(err => {
            alert("Mikrofonzugriff verweigert: " + err);
            isRecording = false;
        });
}

function stopRecording(word, name, timerEl, statusEl) {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
}

function uploadRecording(blob, word, name, statusEl) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("word", word);
    formData.append("audio", blob, "recording.wav");

    fetch("/upload", { method: "POST", body: formData })
        .then(response => {
            if (response.ok) {
                statusEl.textContent = "gespeichert";
            } else {
                statusEl.textContent = "Fehler";
            }
        })
        .catch(err => {
            statusEl.textContent = "Fehler beim Upload";
        });
}
