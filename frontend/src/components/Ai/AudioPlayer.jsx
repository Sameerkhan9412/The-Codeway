// Ai/AudioPlayer.jsx
import React, { useEffect } from "react";
import { speakText } from "../../utils/Ai/speakText";


const AudioPlayer = ({ text }) => {
  useEffect(() => {
    if (text) speakText(text);
  }, [text]);

  return null; // No UI needed
};

export default AudioPlayer;
