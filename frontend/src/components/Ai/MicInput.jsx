// Ai/MicInput.jsx
import React from "react";
import { startSpeechRecognition } from "../../utils/Ai/speechToText";
import axiosClient from "../../utils/axiosClient";

const MicInput = ({ onAIResponse, onUserInput }) => {
  const handleMicClick = () => {
    startSpeechRecognition(async (transcript) => {
      onUserInput(transcript); // send to parent
      const res = await axiosClient.post("/api/ai/ask", { question: transcript });
      onAIResponse(res.data.answer);
    });
  };

  return (
    <button onClick={handleMicClick}>🎤 Speak Answer</button>
  );
};

export default MicInput;
