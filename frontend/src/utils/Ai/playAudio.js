export function playBase64Audio(base64Audio) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Convert base64 to ArrayBuffer
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Decode and play audio
  audioContext.decodeAudioData(bytes.buffer)
    .then((buffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
    })
    .catch((err) => {
      console.error("Audio decoding error:", err);
    });
}
