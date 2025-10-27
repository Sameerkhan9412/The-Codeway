// utils/speechToText.js

export function startSpeechRecognition(callback) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in your browser. Use Chrome.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log("🎤 Voice recognition started. Speak now...");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("🗣️ Recognized text:", transcript);
    callback(transcript);
  };

  recognition.onerror = (event) => {
    console.error("❌ Speech recognition error:", event.error);
    alert("Error: " + event.error);
  };

  recognition.start();
}
